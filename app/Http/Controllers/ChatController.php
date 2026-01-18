<?php

namespace App\Http\Controllers;

use App\Models\ChatSession;
use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Follow;
use App\Events\ChatMessageSent;
use App\Events\ChatStarted;
use App\Events\ChatEnded;
use App\Events\UserWaitingForChat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Events\CallInitiated;
use App\Events\CallResponded;
use App\Events\CallSignaled;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    
    // Start looking for a chat partner
    public function startLooking(Request $request)
    {
        $user = $request->user();

        DB::beginTransaction();

        try {
            // Check if user is already in an active chat
            $activeSession = ChatSession::with(['user1', 'user2'])->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })->where('status', 'active')
                ->where('type', 'random')
                ->first();

            if ($activeSession) {
                $partner = $activeSession->getPartner($user->id);

                // Ensure is_searching is false if already in chat
                $user->is_searching = false;
                $user->save();

                DB::commit();

                $response = [
                    'success' => true,
                    'message' => 'Chat partner found!',
                    'session' => [
                        'id' => $activeSession->id,
                        'session_id' => $activeSession->session_id,
                    ],
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'profile_image' => $partner->profile_image,
                        'gender' => $partner->extra_info['gender'] ?? null,
                    ]
                ];

                return response()->json($response);
            }

            // Set user as searching
            $user->is_searching = true;
            $user->save();

            // Find a matching partner
            $partner = $this->findChatPartner($user);

            if ($partner) {
                // Final check: ensure partner is still searching and not in another chat
                $partner = User::where('id', $partner->id)
                    ->where('is_searching', true)
                    ->whereDoesntHave('chatSessions1', function ($q) {
                        $q->where('status', 'active');
                    })
                    ->whereDoesntHave('chatSessions2', function ($q) {
                        $q->where('status', 'active');
                    })
                    ->first();

                if (!$partner) {
                    DB::commit();
                    return response()->json([
                        'success' => true,
                        'message' => 'Looking for chat partner...',
                        'status' => 'waiting'
                    ]);
                }

                // Create chat session
                $session = ChatSession::create([
                    'session_id' => Str::uuid(),
                    'user1_id' => $user->id,
                    'user2_id' => $partner->id,
                    'status' => 'active'
                ]);

                // Set both users as not searching
                $user->is_searching = false;
                $user->save();

                $partner->is_searching = false;
                $partner->save();

                DB::commit();

                // Notify both users - broadcast to partner
                broadcast(new ChatStarted($session, $partner->id));

                // Return response to current user
                return response()->json([
                    'success' => true,
                    'message' => 'Chat partner found!',
                    'session' => [
                        'id' => $session->id,
                        'session_id' => $session->session_id,
                    ],
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'profile_image' => $partner->profile_image,
                        'gender' => $partner->extra_info['gender'] ?? null,
                    ]
                ]);
            } else {
                DB::commit();
                // Add to waiting list
                broadcast(new UserWaitingForChat($user));

                return response()->json([
                    'success' => true,
                    'message' => 'Looking for chat partner...',
                    'status' => 'waiting'
                ]);
            }
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to start looking: ' . $e->getMessage()
            ], 500);
        }
    }

    private function findChatPartner(User $user)
    {
        $userInterests = $user->extra_info['interests'] ?? [];
        $matchWithInterests = $user->extra_info['match_with_interests'] ?? false;
        $userGender = $user->extra_info['gender'] ?? null;

        // Get list of users this user has skipped (in last 24 hours)
        $skippedUserIds = DB::table('user_skips')
            ->where('user_id', $user->id)
            ->where('updated_at', '>', now()->subHours(24))
            ->pluck('skipped_user_id')
            ->toArray();

        // Get list of users who have skipped this user (in last 24 hours)
        $skippedByUserIds = DB::table('user_skips')
            ->where('skipped_user_id', $user->id)
            ->where('updated_at', '>', now()->subHours(24))
            ->pluck('user_id')
            ->toArray();

        // Combine both lists to exclude
        $excludedUserIds = array_unique(array_merge($skippedUserIds, $skippedByUserIds));

        // Get waiting users (not in active chats and not in skip history)
        $query = User::where('id', '!=', $user->id)
            ->where('is_searching', true)
            ->whereDoesntHave('chatSessions1', function ($q) {
                $q->where('status', 'active');
            })
            ->whereDoesntHave('chatSessions2', function ($q) {
                $q->where('status', 'active');
            });

        // Exclude users in skip history (last 24 hours only)
        if (!empty($excludedUserIds)) {
            $query->whereNotIn('id', $excludedUserIds);
        }

        // Optional: Match based on gender preference
        $preferredGender = $user->extra_info['prefer_gender'] ?? 'both';
        if ($preferredGender !== 'both' && in_array($preferredGender, ['male', 'female'])) {
            $query->whereJsonContains('extra_info->gender', $preferredGender);
        }

        // If user wants to match with interests
        if ($matchWithInterests && !empty($userInterests)) {
            $query->where(function ($q) use ($userInterests) {
                foreach ($userInterests as $interest) {
                    $q->orWhereJsonContains('extra_info->interests', $interest);
                }
            });
        }

        $partner = $query->inRandomOrder()->first();

        // Fallback: If no partner found with exclusions, try without gender filter first
        if (!$partner) {
            $fallbackQuery = User::where('id', '!=', $user->id)
                ->where('is_searching', true)
                ->whereDoesntHave('chatSessions1', function ($q) {
                    $q->where('status', 'active');
                })
                ->whereDoesntHave('chatSessions2', function ($q) {
                    $q->where('status', 'active');
                })
                ->whereNotIn('id', $excludedUserIds); // Still exclude skipped users

            $partner = $fallbackQuery->inRandomOrder()->first();
        }

        // Final fallback: If still no partner, try without any filters (except skips in last 1 hour)
        if (!$partner) {
            // Only exclude users skipped in last 1 hour (more lenient)
            $recentSkipIds = DB::table('user_skips')
                ->where('user_id', $user->id)
                ->where('updated_at', '>', now()->subHour())
                ->pluck('skipped_user_id')
                ->toArray();

            $finalQuery = User::where('id', '!=', $user->id)
                ->where('is_searching', true)
                ->whereDoesntHave('chatSessions1', function ($q) {
                    $q->where('status', 'active');
                })
                ->whereDoesntHave('chatSessions2', function ($q) {
                    $q->where('status', 'active');
                });

            if (!empty($recentSkipIds)) {
                $finalQuery->whereNotIn('id', $recentSkipIds);
            }

            $partner = $finalQuery->inRandomOrder()->first();
        }

        return $partner;
    }

    // Send message
    public function sendMessage(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'message' => 'nullable|string',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm,avi,mov,wav,mp3|max:10240', // 10MB max
        ]);

        $user = $request->user();

        $session = ChatSession::where('session_id', $request->session_id)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })
            ->where('status', 'active')
            ->firstOrFail();

        $attachmentPath = null;
        $attachmentType = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('chat_attachments', 'public');
            $attachmentPath = $path;

            // Determine file type
            $mime = $file->getMimeType();
            if (str_starts_with($mime, 'image/')) {
                $attachmentType = 'image';
            } elseif (str_starts_with($mime, 'video/')) {
                $attachmentType = 'video';
            } elseif (str_starts_with($mime, 'audio/')) {
                $attachmentType = 'audio';
            }
        } elseif ($request->attachment_url && $request->attachment_type) {
            $attachmentPath = $request->attachment_url;
            $attachmentType = $request->attachment_type;
        }

        // Validate that at least message or attachment is present
        if (empty($request->message) && !$attachmentPath) {
            return response()->json([
                'success' => false,
                'message' => 'Either message or attachment is required'
            ], 422);
        }

        $message = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender_id' => $user->id,
            'message' => $request->message,
            'attachment_path' => $attachmentPath,
            'attachment_type' => $attachmentType,
        ]);

        // Load sender relationship for broadcasting
        $message->load('sender');

        broadcast(new ChatMessageSent($message));

        return response()->json([
            'success' => true,
            'message' => 'Message sent',
            'data' => $message
        ]);
    }

    // Get chat messages
    public function getMessages(Request $request, $session_id)
    {
        $user = $request->user();

        $session = ChatSession::where('session_id', $session_id)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })
            ->firstOrFail();

        $messages = $session->messages()->with('sender')->latest()->take(50)->get()->reverse()->values();

        // Mark messages as read
        $session->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }

    public function markAsRead(Request $request, $session_id)
    {
        $user = $request->user();
        $session = ChatSession::where('session_id', $session_id)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })
            ->firstOrFail();

        $session->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    // End chat
    public function endChat(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string'
        ]);

        $user = $request->user();

        DB::beginTransaction();

        try {
            $session = ChatSession::where('session_id', $request->session_id)
                ->where(function ($query) use ($user) {
                    $query->where('user1_id', $user->id)
                        ->orWhere('user2_id', $user->id);
                })
                ->where('status', 'active')
                ->firstOrFail();

            /*
            // Delete all messages
            $messages = $session->messages()->whereNotNull('attachment_path')->get();
            foreach ($messages as $msg) {
                if ($msg->attachment_path && Storage::disk('public')->exists($msg->attachment_path)) {
                    Storage::disk('public')->delete($msg->attachment_path);
                }
            }
            
            // Delete all messages from database
            $session->messages()->delete();
            */

            // Update session status
            $session->update([
                'status' => 'ended',
                'ended_at' => now()
            ]);

            // Set both users as not searching
            $user->is_searching = false;
            $user->save();

            $partnerUser = User::find($session->getPartnerId($user->id));
            if ($partnerUser) {
                $partnerUser->is_searching = false;
                $partnerUser->save();
            }

            // Broadcast chat ended event
            $partnerId = $session->getPartnerId($user->id);
            broadcast(new ChatEnded($session->session_id, $user->id, $partnerId));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Chat ended successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to end chat: ' . $e->getMessage()
            ], 500);
        }
    }

    // Check if user is in chat
    public function checkStatus(Request $request)
    {
        $user = $request->user();

        $session = ChatSession::where(function ($query) use ($user) {
            $query->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id);
        })->where('status', 'active')
            ->where('type', 'random')
            ->first();

        if ($session) {
            $partner = $session->getPartner($user->id);

            return response()->json([
                'success' => true,
                'in_chat' => true,
                'session_id' => $session->session_id,
                'type' => $session->type,
                'partner' => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'profile_image' => $partner->profile_image,
                    'gender' => $partner->extra_info['gender'] ?? null,
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'in_chat' => false,
            'is_searching' => $user->is_searching
        ]);
    }

    // Skip current partner and find new one
    public function skipPartner(Request $request)
    {
        $user = $request->user();

        DB::beginTransaction();

        try {
            // Find and end current active session
            $activeSession = ChatSession::where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })->where('status', 'active')->first();

            if (!$activeSession) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active chat session found.'
                ], 404);
            }

            if ($activeSession->type === 'direct') {
                return response()->json(['success' => false, 'message' => 'Cannot skip a direct chat.'], 403);
            }

            // Get partner info before ending
            $partnerId = $activeSession->getPartnerId($user->id);

            // Use updateOrInsert to handle duplicates gracefully
            DB::table('user_skips')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'skipped_user_id' => $partnerId
                ],
                [
                    'updated_at' => now(),
                    'created_at' => DB::raw('IFNULL(created_at, NOW())')
                ]
            );

            // Update session status
            $activeSession->update([
                'status' => 'ended',
                'ended_by' => $user->id,
                'ended_at' => now()
            ]);

            // Set both users as not searching
            $user->is_searching = false;
            $user->save();

            $partnerUser = User::find($partnerId);
            if ($partnerUser) {
                $partnerUser->is_searching = false;
                $partnerUser->save();
            }

            // Notify partner that user skipped
            broadcast(new ChatEnded($activeSession->session_id, $user->id, $partnerId));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Chat skipped'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Skip partner error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to skip: ' . $e->getMessage()
            ], 500);
        }
    }
    // Stop looking for a chat partner
    public function stopLooking(Request $request)
    {
        $user = $request->user();
        $user->update(['is_searching' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Stopped looking for chat partner'
        ]);
    }

    // Get chat history (past matches)
    public function history(Request $request)
    {
        $user = $request->user();

        $sessions = ChatSession::where(function ($query) use ($user) {
            $query->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id);
        })
            ->where(function ($q) {
                $q->where('status', 'ended')
                    ->orWhere('status', 'active')
                    ->orWhere('type', 'direct');
            })
            ->with(['user1', 'user2'])
            ->latest('updated_at')
            ->get();

        // Get list of users blocked by current user
        $blockedUserIds = Follow::where('sender_id', $user->id)
            ->where('status', 'blocked')
            ->pluck('receiver_id')
            ->toArray();

        $history = $sessions->map(function ($session) use ($user, $blockedUserIds) {
            $partner = $session->user1_id === $user->id ? $session->user2 : $session->user1;
            // Handle case where partner might be deleted
            if (!$partner) {
                return null;
            }

            return [
                'session_id' => $session->session_id,
                'ended_at' => $session->ended_at ?? $session->updated_at,
                'status' => $session->status, // Add status
                'type' => $session->type,
                'partner' => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'profile_image' => $partner->profile_image,
                    'gender' => $partner->extra_info['gender'] ?? null,
                    'is_blocked' => in_array($partner->id, $blockedUserIds),
                ]
            ];
        })->filter()->values();

        // Filter for unique partners
        $uniqueHistory = $history->unique('partner.id')->values();

        return response()->json([
            'success' => true,
            'history' => $uniqueHistory
        ]);
    }

    public function startDirectChat(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();
        $friendId = $request->friend_id;

        // Check if they are friends (mutual follow)
        $isFriend = Follow::where('status', 'accepted')
            ->where(function ($q) use ($user, $friendId) {
                $q->where(function ($q2) use ($user, $friendId) {
                    $q2->where('sender_id', $user->id)->where('receiver_id', $friendId);
                })->orWhere(function ($q2) use ($user, $friendId) {
                    $q2->where('sender_id', $friendId)->where('receiver_id', $user->id);
                });
            })->exists();

        if (!$isFriend) {
            return response()->json(['success' => false, 'message' => 'You are not friends with this user.'], 403);
        }

        // Find or create a direct chat session
        $session = ChatSession::where('type', 'direct')
            ->where(function ($q) use ($user, $friendId) {
                $q->where(function ($q2) use ($user, $friendId) {
                    $q2->where('user1_id', $user->id)->where('user2_id', $friendId);
                })->orWhere(function ($q2) use ($user, $friendId) {
                    $q2->where('user1_id', $friendId)->where('user2_id', $user->id);
                });
            })->first();

        if (!$session) {
            $session = ChatSession::create([
                'session_id' => (string) Str::uuid(),
                'type' => 'direct',
                'user1_id' => $user->id,
                'user2_id' => $friendId,
                'status' => 'active'
            ]);
        } else {
            if ($session->status !== 'active') {
                $session->update(['status' => 'active', 'ended_at' => null]);
            }
        }

        $partner = User::find($friendId);

        // Notify partner that a direct chat has started
        broadcast(new ChatStarted($session, $partner->id));

        return response()->json([
            'success' => true,
            'session' => [
                'id' => $session->id,
                'session_id' => $session->session_id,
            ],
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'profile_image' => $partner->profile_image,
                'gender' => $partner->extra_info['gender'] ?? null,
            ]
        ]);
    }

    public function deleteSession(Request $request, $session_id)
    {
        $user = $request->user();

        $session = ChatSession::where('session_id', $session_id)
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })->first();

        if (!$session) {
            return response()->json(['success' => false, 'message' => 'Session not found.'], 404);
        }

        // Delete all messages in the session
        // Note: In a real app, you might want to only delete for the current user (soft delete),
        // but the user asked to "dlt in both", which could mean deleting the whole session history.
        $session->messages()->delete();

        // If it's a random chat, we might want to end it if it's active
        if ($session->type === 'random' && $session->status === 'active') {
            $session->update(['status' => 'ended', 'ended_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Chat history deleted successfully.'
        ]);
    }

    public function deleteByFriend(Request $request, $friend_id)
    {
        $user = $request->user();

        $session = ChatSession::where(function ($query) use ($user, $friend_id) {
            $query->where('user1_id', $user->id)->where('user2_id', $friend_id);
        })->orWhere(function ($query) use ($user, $friend_id) {
            $query->where('user1_id', $friend_id)->where('user2_id', $user->id);
        })->first();

        if (!$session) {
            return response()->json(['success' => true, 'message' => 'No chat history found.']);
        }

        $session->messages()->delete();

        if ($session->type === 'random' && $session->status === 'active') {
            $session->update(['status' => 'ended', 'ended_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Chat history deleted successfully.'
        ]);
    }

    public function initiateCall(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'type' => 'nullable|string'
        ]);
        $user = $request->user();
        $type = $request->input('type', 'voice');

        $session = ChatSession::where('session_id', $request->session_id)
            ->where(function ($q) use ($user) {
                $q->where('user1_id', $user->id)->orWhere('user2_id', $user->id);
            })->firstOrFail();

        $partnerId = $session->getPartnerId($user->id);
        broadcast(new CallInitiated($session->session_id, $user->id, $partnerId, $type));

        return response()->json(['success' => true]);
    }

    public function respondToCall(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'action' => 'required|string|in:accept,reject,end'
        ]);
        $user = $request->user();

        $session = ChatSession::where('session_id', $request->session_id)
            ->where(function ($q) use ($user) {
                $q->where('user1_id', $user->id)->orWhere('user2_id', $user->id);
            })->firstOrFail();

        $partnerId = $session->getPartnerId($user->id);
        broadcast(new CallResponded($session->session_id, $request->action, $user->id, $partnerId));

        return response()->json(['success' => true]);
    }

    public function signalWebRTC(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'signal' => 'required|array'
        ]);
        $user = $request->user();

        $session = ChatSession::where('session_id', $request->session_id)
            ->where(function ($q) use ($user) {
                $q->where('user1_id', $user->id)->orWhere('user2_id', $user->id);
            })->firstOrFail();

        $partnerId = $session->getPartnerId($user->id);
        broadcast(new CallSignaled($session->session_id, $request->signal, $user->id, $partnerId));

        return response()->json(['success' => true]);
    }
}

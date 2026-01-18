<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\FollowRequestSent;
use App\Events\FollowRequestUpdated;

class FollowController extends Controller
{
    // Send a follow request
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $sender = Auth::user();
        $receiverId = $request->receiver_id;

        if ($sender->id == $receiverId) {
            return response()->json(['message' => 'You cannot follow yourself.'], 400);
        }

        // Check if request already exists
        $existingFollow = Follow::where('sender_id', $sender->id)
            ->where('receiver_id', $receiverId)
            ->first();

        if ($existingFollow) {
            if ($existingFollow->status == 'blocked') {
                 return response()->json(['message' => 'You cannot follow this user.'], 403);
            }
             return response()->json(['message' => 'Request already sent or you are already following.'], 400);
        }

        $follow = Follow::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiverId,
            'status' => 'pending',
        ]);

        // Broadcast event
        broadcast(new FollowRequestSent($follow))->toOthers();

        return response()->json(['message' => 'Follow request sent.', 'data' => $follow]);
    }

    // Accept, Reject, or Block a request
    public function update(Request $request)
    {
        $request->validate([
            'follow_id' => 'required|exists:follows,id',
            'status' => 'required|in:accepted,rejected,blocked',
        ]);

        $user = Auth::user();
        $follow = Follow::findOrFail($request->follow_id);

        // Ensure the user is the receiver of the request (unless blocking, which can be done by either?)
        // For accepting/rejecting, must be receiver.
        // For blocking, we might want a separate logic, but here we assume responding to a request.
        if ($follow->receiver_id !== $user->id) {
             return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $follow->status = $request->status;
        $follow->save();

        // Broadcast event
        broadcast(new FollowRequestUpdated($follow));

        return response()->json(['message' => 'Request ' . $request->status, 'data' => $follow]);
    }

    // List followers
    public function followers()
    {
        $user = Auth::user();
        $followers = $user->followers()->get();
        return response()->json($followers);
    }

    // List following
    public function following()
    {
        $user = Auth::user();
        $following = $user->following()->get();
        return response()->json($following);
    }

    // List mutual friends (both followers and following)
    public function friends()
    {
        $user = Auth::user();
        
        $followers = $user->followers()->get();
        $following = $user->following()->get();
        
        // Merge and unique by ID
        $friends = $followers->concat($following)->unique('id')->values();
        
        // Add unread count for each friend
        $friends = $friends->map(function($friend) use ($user) {
            // Find the session between user and friend
            $session = \App\Models\ChatSession::where(function($q) use ($user, $friend) {
                $q->where('user1_id', $user->id)->where('user2_id', $friend->id);
            })->orWhere(function($q) use ($user, $friend) {
                $q->where('user1_id', $friend->id)->where('user2_id', $user->id);
            })->first();

            $friend->unread_count = 0;
            if ($session) {
                $friend->unread_count = $session->messages()
                    ->where('sender_id', $friend->id)
                    ->where('is_read', false)
                    ->count();
                $friend->session_id = $session->session_id;
            }
            
            return $friend;
        });
        
        return response()->json($friends);
    }

    // Interaction History (Matches, Rejections, Blocks)
    public function history()
    {
        $user = Auth::user();
        
        // Get all interactions where the user is sender or receiver
        $history = Follow::where(function($q) use ($user) {
                $q->where('sender_id', $user->id)
                  ->orWhere('receiver_id', $user->id);
            })
            ->whereIn('status', ['accepted', 'rejected', 'blocked'])
            ->with(['sender', 'receiver'])
            ->latest()
            ->get();

        return response()->json($history);
    }

    // List pending requests
    public function pendingRequests()
    {
        $user = Auth::user();
        $requests = $user->pendingRequests()->with('sender')->get();
        return response()->json($requests);
    }
    public function removeFriend(Request $request)
    {
        $request->validate([
            'friend_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $friendId = $request->friend_id;

        $follow = Follow::where(function($q) use ($user, $friendId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $friendId);
        })->orWhere(function($q) use ($user, $friendId) {
            $q->where('sender_id', $friendId)->where('receiver_id', $user->id);
        })->first();

        if ($follow) {
            // Store data for broadcast before deleting
            $followData = clone $follow;
            $follow->delete();
            
            // Broadcast update
            broadcast(new FollowRequestUpdated($followData));
            
            return response()->json(['success' => true, 'message' => 'Friend removed.']);
        }

        return response()->json(['success' => false, 'message' => 'Friendship not found.'], 404);
    }

    public function blockUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetId = $request->user_id;

        $follow = Follow::where(function($q) use ($user, $targetId) {
            $q->where('sender_id', $user->id)->where('receiver_id', $targetId);
        })->orWhere(function($q) use ($user, $targetId) {
            $q->where('sender_id', $targetId)->where('receiver_id', $user->id);
        })->first();

        if ($follow) {
            $follow->update([
                'sender_id' => $user->id,
                'receiver_id' => $targetId,
                'status' => 'blocked'
            ]);
        } else {
            $follow = Follow::create([
                'sender_id' => $user->id,
                'receiver_id' => $targetId,
                'status' => 'blocked'
            ]);
        }

        broadcast(new FollowRequestUpdated($follow));

        return response()->json(['success' => true, 'message' => 'User blocked.']);
    }

    public function unblockUser(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = Auth::user();
        $targetId = $request->user_id;

        $follow = Follow::where('status', 'blocked')
            ->where(function($q) use ($user, $targetId) {
                // Must be the one who blocked (sender)
                $q->where('sender_id', $user->id)->where('receiver_id', $targetId);
            })->first();

        if ($follow) {
            // Unblock and restore friendship (or just delete the block record if you want them to request again)
            // User requested: "so user will again chat with parner" -> implies restoring friendship
            $follow->update([
                'status' => 'accepted'
            ]);

            broadcast(new FollowRequestUpdated($follow));

            return response()->json(['success' => true, 'message' => 'User unblocked.']);
        }

        return response()->json(['success' => false, 'message' => 'Block record not found or unauthorized.'], 404);
    }
}

<?php

use Illuminate\Support\Facades\Broadcast;

// Existing channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 1. For ChatStarted event (user-specific notifications)
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// 2. For ChatEnded and ChatMessageSent events (chat room)
Broadcast::channel('chat.{sessionId}', function ($user, $sessionId) {
    // Check if user is part of this chat session
    $session = \App\Models\ChatSession::where('session_id', $sessionId)
        ->where(function($query) use ($user) {
            $query->where('user1_id', $user->id)
                  ->orWhere('user2_id', $user->id);
        })
        ->first();
    
    if ($session) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'profile_image' => $user->profile_image
        ];
    }
    
    return false;
});

// 3. For UserWaitingForChat event (public waiting channel)
//Broadcast::channel('chat.waiting', function ($user, $userId) {
//    // Allow all authenticated users to listen to waiting channel
//    return (int) $user->id === (int) $userId;
////    return true;
//});
// 4. For tracking online status
Broadcast::channel('online-users', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'profile_image' => $user->profile_image
    ];
});

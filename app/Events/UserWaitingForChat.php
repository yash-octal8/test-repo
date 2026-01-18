<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserWaitingForChat implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $userInfo;

    public function __construct(User $user)
    {
        $this->userId = $user->id;
        $this->userInfo = [
            'id' => $user->id,
            'name' => $user->name,
            'profile_image' => $user->profile_image,
            'interests' => $user->extra_info['interests'] ?? [],
            'match_with_interests' => $user->extra_info['match_with_interests'] ?? false,
            'gender' => $user->extra_info['gender'] ?? null,
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.waiting'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.waiting';
    }
}

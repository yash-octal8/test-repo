<?php

namespace App\Events;

use App\Models\Follow;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FollowRequestSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $follow;

    /**
     * Create a new event instance.
     */
    public function __construct(Follow $follow)
    {
        $this->follow = $follow;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->follow->receiver_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'follow.request.sent';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'follow_id' => $this->follow->id,
            'sender' => [
                'id' => $this->follow->sender->id,
                'name' => $this->follow->sender->name,
                'email' => $this->follow->sender->email,
                'profile_image' => $this->follow->sender->profile_image,
            ],
            'created_at' => $this->follow->created_at,
        ];
    }
}

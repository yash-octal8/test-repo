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

class FollowRequestUpdated implements ShouldBroadcastNow
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
        // Notify both the sender and the receiver
        return [
            new PrivateChannel('user.' . $this->follow->sender_id),
            new PrivateChannel('user.' . $this->follow->receiver_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'follow.request.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'follow_id' => $this->follow->id,
            'status' => $this->follow->status,
            'sender' => [
                'id' => $this->follow->sender->id,
                'name' => $this->follow->sender->name,
                'profile_image' => $this->follow->sender->profile_image,
            ],
            'receiver' => [
                'id' => $this->follow->receiver->id,
                'name' => $this->follow->receiver->name,
                'profile_image' => $this->follow->receiver->profile_image,
            ],
        ];
    }
}

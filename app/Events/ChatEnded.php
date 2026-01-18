<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatEnded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $endedBy;
    public $partnerId;

    public function __construct($sessionId, $endedBy, $partnerId = null)
    {
        $this->sessionId = $sessionId;
        $this->endedBy = $endedBy;
        $this->partnerId = $partnerId;
        \Log::info("ChatEnded event created: session={$sessionId}, endedBy={$endedBy}, partnerId={$partnerId}");
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PresenceChannel('chat.' . $this->sessionId),
        ];

        if ($this->partnerId) {
            $channels[] = new PrivateChannel('user.' . $this->partnerId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'chat.ended';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'ended_by' => $this->endedBy,
            'message' => 'Chat ended by user',
        ];
    }
}
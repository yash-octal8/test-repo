<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallResponded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $action;
    public $responderId;
    public $partnerId;

    public function __construct($sessionId, $action, $responderId, $partnerId)
    {
        $this->sessionId = $sessionId;
        $this->action = $action;
        $this->responderId = $responderId;
        $this->partnerId = $partnerId;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('chat.' . $this->sessionId),
            new PrivateChannel('user.' . $this->partnerId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.responded';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'action' => $this->action,
            'responder_id' => $this->responderId,
        ];
    }
}

<?php

namespace App\Events;

use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallInitiated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $callerId;
    public $recipientId;
    public $type;

    public function __construct($sessionId, $callerId, $recipientId, $type = 'voice')
    {
        $this->sessionId = $sessionId;
        $this->callerId = $callerId;
        $this->recipientId = $recipientId;
        $this->type = $type;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('chat.' . $this->sessionId),
            new PrivateChannel('user.' . $this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.initiated';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'caller_id' => $this->callerId,
            'type' => $this->type,
        ];
    }
}

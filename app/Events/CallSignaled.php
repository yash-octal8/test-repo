<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallSignaled implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $sessionId;
    public $signal;
    public $senderId;
    public $recipientId;

    public function __construct($sessionId, $signal, $senderId, $recipientId)
    {
        $this->sessionId = $sessionId;
        $this->signal = $signal;
        $this->senderId = $senderId;
        $this->recipientId = $recipientId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->recipientId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'call.signaled';
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'signal' => $this->signal,
            'sender_id' => $this->senderId,
        ];
    }
}

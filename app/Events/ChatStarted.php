<?php

namespace App\Events;

use App\Models\ChatSession;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
//use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatStarted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatSession;
    public $userId;

    public function __construct(ChatSession $chatSession, $userId)
    {
        $this->chatSession = $chatSession;
        $this->userId = $userId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'chat.started';
    }

    public function broadcastWith(): array
    {
        $partner = $this->chatSession->getPartner($this->userId);
        
        return [
            'session_id' => $this->chatSession->session_id,
            'chat_session_id' => $this->chatSession->id,
            'type' => $this->chatSession->type,
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'profile_image' => $partner->profile_image,
                'gender' => $partner->extra_info['gender'] ?? null,
            ],
        ];
    }
}

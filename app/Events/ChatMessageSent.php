<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PresenceChannel('chat.' . $this->message->chatSession->session_id),
        ];

        // Also broadcast to the recipient's private channel for notifications
        $session = $this->message->chatSession;
        $recipientId = $session->user1_id === $this->message->sender_id 
            ? $session->user2_id 
            : $session->user1_id;

        if ($recipientId) {
            $channels[] = new PrivateChannel('user.' . $recipientId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'sender_id' => $this->message->sender_id,
                'message' => $this->message->message,
                'attachment_url' => $this->message->attachment_url,
                'attachment_type' => $this->message->attachment_type,
                'created_at' => $this->message->created_at->toDateTimeString(),
                'sender' => [
                    'id' => $this->message->sender->id,
                    'name' => $this->message->sender->name,
                    'profile_image' => $this->message->sender->profile_image,
                ],
                'chat_session_id' => $this->message->chatSession->session_id,
            ]
        ];
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    protected $fillable = [
        'chat_session_id',
        'sender_id',
        'message',
        'attachment_path',
        'attachment_type',
        'is_read'
    ];

    protected $appends = ['attachment_url'];

    public function chatSession(): BelongsTo
    {
        return $this->belongsTo(ChatSession::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if (!$this->attachment_path) {
            return null;
        }
        
        if (str_starts_with($this->attachment_path, 'http')) {
            return $this->attachment_path;
        }

        return asset('storage/' . $this->attachment_path);
    }
}
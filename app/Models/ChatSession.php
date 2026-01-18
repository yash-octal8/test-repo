<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    protected $fillable = [
        'session_id',
        'type',
        'user1_id',
        'user2_id',
        'status',
        'ended_at'
    ];

    protected $casts = [
        'ended_at' => 'datetime'
    ];

    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function getPartnerId(int $userId): int
    {
        return $this->user1_id === $userId ? $this->user2_id : $this->user1_id;
    }

    public function getPartner(int $userId): ?User
    {
        return $this->user1_id === $userId ? $this->user2 : $this->user1;
    }

    public function isParticipant(int $userId): bool
    {
        return $this->user1_id === $userId || $this->user2_id === $userId;
    }
}
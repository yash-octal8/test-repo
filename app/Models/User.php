<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',

        // Guest user fields
        'guest_uid',
        'ip_address',
        'location',
        'device_info',

        // Social auth fields
        'google_id',
        'facebook_id',

        // Profile fields
        'profile_image',
        'extra_info',
        'is_searching',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast attributes.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',

            // JSON fields
            'device_info' => 'array',
            'extra_info' => 'array',
            'is_searching' => 'boolean',
        ];
    }
    
    public function chatSessions1()
    {
        return $this->hasMany(ChatSession::class, 'user1_id');
    }

    public function chatSessions2()
    {
        return $this->hasMany(ChatSession::class, 'user2_id');
    }

    public function activeChatSession()
    {
        return $this->chatSessions1()
            ->where('status', 'active')
            ->orWhere(function($query) {
                $query->whereHas('chatSessions2', function($q) {
                    $q->where('status', 'active');
                });
            })
            ->first();
    }

    public function sentMessages()
    {
        return $this->hasMany(ChatMessage::class, 'sender_id');
    }

    // Follower Relationships

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'receiver_id', 'sender_id')
            ->wherePivot('status', 'accepted')
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'sender_id', 'receiver_id')
            ->wherePivot('status', 'accepted')
            ->withTimestamps();
    }

    public function pendingRequests()
    {
        return $this->hasMany(Follow::class, 'receiver_id')
            ->where('status', 'pending');
    }

    public function sentRequests()
    {
        return $this->hasMany(Follow::class, 'sender_id')
            ->where('status', 'pending');
    }

    public function blockedUsers()
    {
        return $this->belongsToMany(User::class, 'follows', 'sender_id', 'receiver_id')
            ->wherePivot('status', 'blocked')
            ->withTimestamps();
    }
}

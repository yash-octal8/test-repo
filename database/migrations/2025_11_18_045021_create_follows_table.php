<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->id();

            // Sender
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_guest_uid')->nullable();

            // Receiver
            $table->foreignId('receiver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receiver_guest_uid')->nullable();

            // Status: pending, accepted, rejected, blocked
            $table->enum('status', ['pending', 'accepted', 'rejected', 'blocked'])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE chat_messages MODIFY COLUMN attachment_type ENUM('image', 'video', 'audio', 'gif') DEFAULT NULL");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE chat_messages MODIFY COLUMN attachment_type ENUM('image', 'video', 'audio') DEFAULT NULL");
        });
    }
};

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Follow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_send_follow_request()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        $response = $this->actingAs($sender)->postJson('/api/follow/request', [
            'receiver_id' => $receiver->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Follow request sent.']);

        $this->assertDatabaseHas('follows', [
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => 'pending',
        ]);
    }

    public function test_user_can_accept_follow_request()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $follow = Follow::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($receiver)->postJson('/api/follow/respond', [
            'follow_id' => $follow->id,
            'status' => 'accepted',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Request accepted']);

        $this->assertDatabaseHas('follows', [
            'id' => $follow->id,
            'status' => 'accepted',
        ]);
    }

    public function test_user_can_block_follow_request()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();
        $follow = Follow::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($receiver)->postJson('/api/follow/respond', [
            'follow_id' => $follow->id,
            'status' => 'blocked',
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Request blocked']);

        $this->assertDatabaseHas('follows', [
            'id' => $follow->id,
            'status' => 'blocked',
        ]);
    }

    public function test_user_can_see_followers()
    {
        $user = User::factory()->create();
        $follower = User::factory()->create();

        Follow::create([
            'sender_id' => $follower->id,
            'receiver_id' => $user->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($user)->getJson('/api/follow/followers');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    }
    public function test_user_can_unblock_user()
    {
        $sender = User::factory()->create();
        $receiver = User::factory()->create();

        // Create a blocked follow relationship
        $follow = Follow::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => 'blocked',
        ]);

        $response = $this->actingAs($sender)->postJson('/api/follow/unblock', [
            'user_id' => $receiver->id,
        ]);

        $response->assertStatus(200)
            ->assertJson(['message' => 'User unblocked.']);

        $this->assertDatabaseHas('follows', [
            'id' => $follow->id,
            'status' => 'accepted',
        ]);
    }
}

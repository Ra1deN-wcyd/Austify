<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminRestrictionSystemTest extends TestCase
{
    use RefreshDatabase;

    public function test_banned_user_cannot_log_in(): void
    {
        $this->makeUser([
            'name' => 'Banned User',
            'email' => 'banned@aust.edu',
            'password' => 'password123',
            'role' => 'member',
            'is_banned' => true,
        ]);

        $response = $this->postJson('/api/accounts/login', [
            'email' => 'banned@aust.edu',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Your account is permanently banned.',
        ]);
    }

    public function test_timed_out_user_is_read_only_for_write_routes(): void
    {
        $member = $this->makeUser([
            'name' => 'Timed User',
            'email' => 'member@aust.edu',
            'password' => 'password123',
            'role' => 'member',
            'timeout_until' => now()->addDays(2),
        ]);

        Sanctum::actingAs($member);

        $this->getJson('/api/accounts/my-profile')->assertOk();

        $this->postJson('/api/accounts/update-profile', [
            'name' => 'Blocked Update',
        ])->assertStatus(403)->assertJsonStructure(['message', 'timeout_until']);
    }

    public function test_admin_can_timeout_untimeout_ban_and_unban_member(): void
    {
        $admin = $this->makeUser([
            'name' => 'Admin User',
            'email' => 'admin@aust.edu',
            'password' => 'password123',
            'role' => 'admin',
        ]);

        $member = $this->makeUser([
            'name' => 'Normal User',
            'email' => 'normal@aust.edu',
            'password' => 'password123',
            'role' => 'member',
        ]);

        Sanctum::actingAs($admin);

        $this->postJson("/api/admin/users/{$member->id}/timeout", [
            'duration' => '7_days',
        ])->assertOk();
        $member->refresh();
        $this->assertNotNull($member->timeout_until);

        $this->postJson("/api/admin/users/{$member->id}/untimeout")->assertOk();
        $member->refresh();
        $this->assertFalse((bool) $member->is_banned);
        $this->assertNull($member->timeout_until);

        $this->postJson("/api/admin/users/{$member->id}/ban")->assertOk();
        $member->refresh();
        $this->assertTrue((bool) $member->is_banned);
        $this->assertNull($member->timeout_until);

        $this->postJson("/api/admin/users/{$member->id}/unban")->assertOk();
        $member->refresh();
        $this->assertFalse((bool) $member->is_banned);
        $this->assertNull($member->timeout_until);
    }

    private function makeUser(array $attributes): User
    {
        $user = new User();

        foreach ($attributes as $key => $value) {
            $user->{$key} = $value;
        }

        $user->save();

        return $user;
    }
}

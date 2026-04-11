<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Verify the API is reachable. We hit a JSON endpoint so this test
     * never depends on a Vite/frontend build being present in CI.
     */
    public function test_api_is_reachable(): void
    {
        // The login endpoint exists and rejects empty bodies with 422,
        // which proves the app booted and routing works correctly.
        $response = $this->postJson('/api/accounts/login', []);

        $response->assertStatus(422);
    }
}

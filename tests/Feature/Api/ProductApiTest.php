<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_endpoints_require_authentication(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
    }

    public function test_users_can_register_log_in_and_log_out_through_the_api(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Jamie Parker',
            'email' => 'jamie@example.com',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])
            ->assertCreated()
            ->assertJsonPath('user.email', 'jamie@example.com')
            ->assertJsonStructure(['token', 'user']);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'jamie@example.com',
            'password' => 'secure-password',
        ])->assertOk();

        $token = $loginResponse->json('token');

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('email', 'jamie@example.com');

        $this->withToken($token)
            ->postJson('/api/logout')
            ->assertOk();

        $this->assertDatabaseMissing('personal_access_tokens', [
            'token' => hash('sha256', $token),
        ]);
    }

    public function test_users_can_manage_only_their_own_products(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::create([
            'user_id' => $user->id,
            'name' => 'Canvas Tote',
            'description' => 'A durable everyday bag.',
            'price' => 24.50,
            'stock' => 8,
        ]);
        $otherProduct = Product::create([
            'user_id' => $otherUser->id,
            'name' => 'Other Product',
            'description' => 'Not part of this shop.',
            'price' => 10,
            'stock' => 2,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $product->id);

        $this->withToken($token)
            ->putJson("/api/products/{$product->id}", [
                'name' => 'Updated Tote',
                'description' => 'A refreshed product description.',
                'price' => 29.95,
                'stock' => 6,
            ])
            ->assertOk()
            ->assertJsonPath('name', 'Updated Tote');

        $this->withToken($token)
            ->getJson("/api/products/{$otherProduct->id}")
            ->assertForbidden();

        $this->withToken($token)
            ->deleteJson("/api/products/{$otherProduct->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('products', ['id' => $otherProduct->id]);
    }

    public function test_users_can_create_a_product_for_their_shop(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/products', [
                'name' => 'Ceramic Mug',
                'description' => 'Handmade ceramic mug.',
                'price' => 18.25,
                'stock' => 12,
            ])
            ->assertCreated()
            ->assertJsonPath('name', 'Ceramic Mug')
            ->assertJsonPath('user_id', $user->id);

        $this->assertDatabaseHas('products', [
            'user_id' => $user->id,
            'name' => 'Ceramic Mug',
        ]);
    }
}

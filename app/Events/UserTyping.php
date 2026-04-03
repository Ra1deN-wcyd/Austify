<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserTyping implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;
    public int $userId;
    public string $userName;
    public bool $isTyping;

    public function __construct(int $conversationId, User $user, bool $isTyping)
    {
        $this->conversationId = $conversationId;
        $this->userId         = $user->id;
        $this->userName       = $user->name;
        $this->isTyping       = $isTyping;
    }

    /**
     * Same private channel pattern as MessageSent.
     * Frontend listens on: private-conversation.{id}
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.typing'; // Frontend listens for `.user.typing`
    }

    /**
     * Only broadcast the fields the frontend needs.
     */
    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->conversationId,
            'user_id'         => $this->userId,
            'user_name'       => $this->userName,
            'is_typing'       => $this->isTyping,
        ];
    }
}
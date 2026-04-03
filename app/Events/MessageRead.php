<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $conversationId;
    public int $readByUserId;
    public string $readAt;

    public function __construct(int $conversationId, int $readByUserId, string $readAt)
    {
        $this->conversationId = $conversationId;
        $this->readByUserId   = $readByUserId;
        $this->readAt         = $readAt;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->conversationId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.read'; // Frontend listens for `.message.read`
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id'  => $this->conversationId,
            'read_by_user_id'  => $this->readByUserId,
            'read_at'          => $this->readAt,
        ];
    }
}
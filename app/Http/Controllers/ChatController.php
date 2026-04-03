<?php

namespace App\Http\Controllers;

use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class ChatController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     */
    public function index()
    {
        $user = Auth::user();

        $conversations = $user->conversations()
            ->with(['users', 'lastMessage'])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('user_id', '!=', $user->id)
                      ->whereNull('read_at');
            }])
            ->latest('updated_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $conversations,
        ]);
    }

    /**
     * Get messages of a conversation.
     * Also auto-marks unread messages as seen (same as opening a chat).
     */
    public function show($id)
    {
        $conversation = Conversation::with('users')->findOrFail($id);

        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->paginate(30);

        // Auto-mark as seen when the chat is opened
        $this->performMarkSeen($conversation);

        return response()->json([
            'success' => true,
            'data'    => $messages,
        ]);
    }

    /**
     * Start a 1-on-1 conversation.
     */
    public function start(Request $request)
    {
        // Validate input
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);
// Prevent starting a conversation with oneself
        $recipientId   = $request->user_id;
        $currentUserId = Auth::id();

        if ($recipientId == $currentUserId) {
            return response()->json([
                'error' => 'You cannot start a conversation with yourself.',
            ], 400);
        }
//not creating duplicate conversations between the same two users

        $conversation = Conversation::whereHas('users', fn($q) => $q->where('user_id', $currentUserId))
            ->whereHas('users', fn($q) => $q->where('user_id', $recipientId))
            ->with('users')
            ->first();
//if no existing conversation, create a new one and attach both users

        if (!$conversation) {
            $conversation = Conversation::create();
            $conversation->users()->attach([$currentUserId, $recipientId]);
            $conversation->load('users');
        }

        return response()->json([
            'success' => true,
            'data'    => $conversation,
        ]);
    }

    /**
     * Send a message.
     */
    public function store(Request $request)
    {
        // Validate input
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'body'            => 'required|string|max:1000',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

// Ensure the user is part of this conversation

        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
// Create the message and broadcast it to others in the conversation
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id'         => Auth::id(),
            'body'            => $request->body,
        ]);

        broadcast(new MessageSent($message->load('user')))->toOthers();

        $conversation->touch();

        return response()->json([
            'success' => true,
            'data'    => $message->load('user'),
        ]);
    }

    /**
     * ✅ SEEN — Mark all unread messages in a conversation as read.
     * Called explicitly: POST /api/chat/conversations/{id}/seen
     *
     * This broadcasts a MessageRead event so the sender's UI
     * can update to double-tick (✓✓).
     */
    public function markSeen($id)
    {
        $conversation = Conversation::findOrFail($id);

        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $readAt = $this->performMarkSeen($conversation);

        return response()->json([
            'success' => true,
            'message' => 'Messages marked as seen.',
            'read_at' => $readAt,
        ]);
    }

    /**
     * ✅ TYPING — Broadcast typing status to others in a conversation.
     * Called: POST /api/chat/typing
     * Body: { "conversation_id": 1, "is_typing": true }
     *
     * Frontend should call this with is_typing: true on keypress,
     * and is_typing: false on blur or after a short debounce.
     */
    public function typing(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'is_typing'       => 'required|boolean',
        ]);

        $conversation = Conversation::findOrFail($request->conversation_id);

        if (!$conversation->users()->where('user_id', Auth::id())->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Broadcast to everyone else in this conversation
        broadcast(new UserTyping($conversation->id, Auth::user(), $request->is_typing))->toOthers();

        return response()->json([
            'success' => true,
        ]);
    }

    // -------------------------------------------------------------------------
    // Private Helpers
    // -------------------------------------------------------------------------

    /**
     * Mark all messages NOT sent by the current user as read,
     * then fire a broadcast so senders can update their UI.
     */
    private function performMarkSeen(Conversation $conversation): ?string
    {
        $userId = Auth::id();
        $now    = Carbon::now();

        // Only update messages sent by others that haven't been read yet
        $updated = $conversation->messages()
            ->where('user_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => $now]);

        if ($updated > 0) {
            // Notify everyone else (i.e. the senders) that their messages were read
            broadcast(new MessageRead($conversation->id, $userId, $now->toISOString()))->toOthers();

            return $now->toISOString();
        }

        return null;
    }
}
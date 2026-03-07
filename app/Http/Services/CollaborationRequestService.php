<?php
namespace App\Http\Services;

use App\Models\CollaborationRequest;

class CollaborationRequestService
{
    public function storeRequest($collaborationId, $message) {
        return CollaborationRequest::create([
            'collaboration_id' => $collaborationId,
            'user_id' => auth()->id(),
            'message' => $message,
            'status' => 'pending'
        ]);
    }

    public function getRequestsByCollab($collaborationId) {
        return CollaborationRequest::where('collaboration_id', $collaborationId)->with('user:id,name')->get();
    }

    public function updateStatus($id, $status) {
        $request = CollaborationRequest::findOrFail($id);
        $request->update(['status' => $status]);
        return $request;
    }
}
<?php
namespace App\Http\Services;

use App\Models\Collaboration;
use Illuminate\Support\Facades\Auth;

class CollaborationService
{
    public function createCollaboration($request)
    {
        return Collaboration::create([
            'user_id' => Auth::id(),
            'title' => $request->input('title'), // Using input()
            'type' => $request->input('type'),
            'tech_stack' => $request->input('tech_stack'),
            'description' => $request->input('description'),
            'team_size' => $request->input('team_size'),
            'contact' => $request->input('contact'),
            'status' => 'open'
        ]);
    }

    public function getAllCollaborations() {
        return Collaboration::with('user:id,name')->latest()->get();
    }

    public function getSingleCollaboration($id) {
        return Collaboration::with(['user:id,name', 'requests.user:id,name'])->findOrFail($id);
    }

    public function updateCollaboration($request, $id) {
        $collab = Collaboration::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $collab->update($request->all()); // Using all()
        return $collab;
    }

    public function deleteCollaboration($id) {
        $collab = Collaboration::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        return $collab->delete();
    }
}
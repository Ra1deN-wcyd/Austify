<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\CollaborationService;

class CollaborationController extends Controller
{
    protected $collabService;

    public function __construct(CollaborationService $collabService)
    {
        $this->collabService = $collabService;
    }

    public function store(Request $request)
    {
        $collab = $this->collabService->createCollaboration($request);
        return response()->json(['message' => 'Collaboration posted successfully', 'data' => $collab], 201);
    }

    public function index() {
        return response()->json($this->collabService->getAllCollaborations(), 200);
    }

    public function show($id) {
        return response()->json($this->collabService->getSingleCollaboration($id), 200);
    }

    public function update(Request $request, $id) {
        return response()->json($this->collabService->updateCollaboration($request, $id), 200);
    }

    public function destroy($id) {
        return response()->json($this->collabService->deleteCollaboration($id), 200);
    }
}
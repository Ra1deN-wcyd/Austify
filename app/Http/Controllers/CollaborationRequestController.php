<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Services\CollaborationRequestService;

class CollaborationRequestController extends Controller
{
    protected $requestService;

    public function __construct(CollaborationRequestService $requestService) {
        $this->requestService = $requestService;
    }

    public function store(Request $request, $id) {
        $data = $this->requestService->storeRequest($id, $request->input('message'));
        return response()->json(['message' => 'Application sent', 'data' => $data], 201);
    }

    public function index($id) {
        return response()->json($this->requestService->getRequestsByCollab($id), 200);
    }

    public function accept($id) {
        $data = $this->requestService->updateStatus($id, 'accepted');
        return response()->json(['message' => 'Request accepted', 'data' => $data], 200);
    }

    public function reject($id) {
        $data = $this->requestService->updateStatus($id, 'rejected');
        return response()->json(['message' => 'Request rejected', 'data' => $data], 200);
    }
}

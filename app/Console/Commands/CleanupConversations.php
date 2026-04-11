<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Conversation;
use Illuminate\Support\Facades\DB;

class CleanupConversations extends Command
{
    protected $signature = 'chat:cleanup-duplicates';
    protected $description = 'Find and merge duplicate 1-on-1 conversations';

    public function handle()
    {
        $this->info('Searching for duplicate 1-on-1 conversations...');

        // Find all 1-on-1s and group them by user pair in PHP to avoid SQL dialect issues
        $convs = Conversation::has('users', 2)->with('users')->get();
        $pairs = [];
        
        foreach ($convs as $conv) {
            $userIds = $conv->users->pluck('id')->sort()->values()->toArray();
            $key = implode('-', $userIds);
            
            if (!isset($pairs[$key])) {
                $pairs[$key] = [];
            }
            $pairs[$key][] = $conv;
        }
        
        foreach ($pairs as $key => $convList) {
            if (count($convList) > 1) {
                $this->warn("Found " . count($convList) . " conversations for user pair " . $key);
                
                // Keep the one with the most messages or the oldest one
                $keep = $convList[0];
                $toDelete = array_slice($convList, 1);
                
                foreach ($toDelete as $delConv) {
                    $this->line("Merging Conv " . $delConv->id . " into " . $keep->id);
                    
                    // Move messages
                    DB::table('messages')
                        ->where('conversation_id', $delConv->id)
                        ->update(['conversation_id' => $keep->id]);
                        
                    // Delete the duplicate conversation and its pivot entries
                    $delConv->users()->detach();
                    $delConv->delete();
                }
            }
        }
        
        $this->info('Cleanup complete.');
    }
}

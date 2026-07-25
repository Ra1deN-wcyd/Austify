<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'gender_preference',
        'location',
        'room_type',
        'rent_budget_min',
        'rent_budget_max',
        'smoker',
        'gamer_type',
        'move_in_date',
        'description',
        'contact_info',
        'status',
    ];

    protected $casts = [
        'move_in_date'    => 'date',
        'rent_budget_min' => 'integer',
        'rent_budget_max' => 'integer',
    ];

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------------------------
    // Query Scopes
    // -------------------------------------------------------------------------

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfGender($query, $gender)
    {
        return $query->where('gender_preference', $gender);
    }

    public function scopeOfLocation($query, $location)
    {
        return $query->where('location', 'LIKE', '%' . $location . '%');
    }

    public function scopeOfRoomType($query, $roomType)
    {
        return $query->where('room_type', $roomType);
    }

    public function scopeOfBudgetMin($query, $min)
    {
        // Posts whose max budget is at least the requested min (overlapping range)
        return $query->where(function ($q) use ($min) {
            $q->whereNull('rent_budget_max')->orWhere('rent_budget_max', '>=', $min);
        });
    }

    public function scopeOfBudgetMax($query, $max)
    {
        // Posts whose min budget is at most the requested max
        return $query->where(function ($q) use ($max) {
            $q->whereNull('rent_budget_min')->orWhere('rent_budget_min', '<=', $max);
        });
    }

    public function scopeOfSmoker($query, $smoker)
    {
        return $query->where('smoker', $smoker);
    }

    public function scopeOfGamer($query, $gamer)
    {
        return $query->where('gamer_type', $gamer);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // -------------------------------------------------------------------------
    // Filter Helper — applies all non-null filters from a filters array
    // -------------------------------------------------------------------------

    /**
     * Apply all active filters from an associative array.
     * Usage: RoomPost::applyFilters($filters)->paginate(12)
     */
    public static function applyFilters(array $filters)
    {
        $query = static::query()->with('user:id,name');

        // Default: only show active posts unless status filter explicitly set
        $status = $filters['status'] ?? 'active';
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if (!empty($filters['type'])) {
            $query->ofType($filters['type']);
        }

        if (!empty($filters['gender'])) {
            $query->ofGender($filters['gender']);
        }

        if (!empty($filters['location'])) {
            $query->ofLocation($filters['location']);
        }

        if (!empty($filters['room_type'])) {
            $query->ofRoomType($filters['room_type']);
        }

        if (isset($filters['budget_min']) && $filters['budget_min'] !== '') {
            $query->ofBudgetMin((int) $filters['budget_min']);
        }

        if (isset($filters['budget_max']) && $filters['budget_max'] !== '') {
            $query->ofBudgetMax((int) $filters['budget_max']);
        }

        if (!empty($filters['smoker'])) {
            $query->ofSmoker($filters['smoker']);
        }

        if (!empty($filters['gamer'])) {
            $query->ofGamer($filters['gamer']);
        }

        return $query->latest();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'unit_name',
        'unit_code',
        'ownership_status',
        'y2020',
        'y2021',
        'y2022',
        'y2023',
        'y2024',
        'y2025',
        'y2026',
        'total',
        'received',
        'balance',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function owners(): BelongsToMany
    {
        return $this->belongsToMany(Owner::class);
    }


    /**
     *  payments
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

     public function tenant(): HasOne // <--- ADD THIS RELATIONSHIP
    {
        return $this->hasOne(Tenant::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}

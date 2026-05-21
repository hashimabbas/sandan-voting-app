<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voter extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'voter_id_no',  // Unique ID from XLS
        'name',
        'phone',
        'number_of_units', // From XLS, determines voting power
        'building_no',     // <--- ADD THIS
        'unit_name',       // <--- ADD THIS
        'mulkiya_status',  // <--- ADD THIS
        'has_voted',       // Flag to track if this voter_id_no has submitted a vote
        'receipt_code',
        'token',           // A temporary token for voting process (optional, or use session/OTP)
        'otp_code',        
        'otp_expires_at',  
    ];

    protected $casts = [
        'number_of_units' => 'integer',
        'has_voted' => 'boolean',
        'otp_expires_at' => 'datetime', // <--- ADD THIS
    ];

    // Relationships

    public function election(): BelongsTo // Add this
    {
        return $this->belongsTo(Election::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }
}

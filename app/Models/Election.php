<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str; // For slug generation

class Election extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_time',
        'end_time',
        'status', // pending, active, completed, archived
        'is_public',
        'slug',
        'show_results',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_public' => 'boolean',
        'show_results' => 'boolean',
    ];

    /**
     * Generate a unique slug before saving the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($election) {
            if (empty($election->slug)) {
                $election->slug = Str::slug($election->title);
                $originalSlug = $election->slug;
                $count = 1;
                while (static::where('slug', $election->slug)->exists()) {
                    $election->slug = $originalSlug . '-' . $count++;
                }
            }
        });
    }

    // Relationships
    public function voters(): HasMany
    {
        return $this->hasMany(Voter::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    /**
     * Check if the election is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active' &&
               $this->start_time && $this->end_time &&
               now()->between($this->start_time, $this->end_time);
    }

    /**
     * Check if the election is completed.
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed' || ($this->end_time && now()->gt($this->end_time) && $this->status !== 'archived');
    }
}

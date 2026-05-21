<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens; // <--- ADD THIS IMPORT

class Owner extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens; // <--- ADD HasApiTokens TRAIT

    protected $fillable = [
        'name',
        'phone',
        'photo',
        'owner_id_no',
        'civil_id',
        'otp_code',
        'otp_expires_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',
        'otp_expires_at',
    ];

    protected function casts(): array
    {
        return [
            // 'email_verified_at' => 'datetime', // Owners might not have this
            'password' => 'hashed',
            'otp_expires_at' => 'datetime',
        ];
    }

    public function units(): BelongsToMany
    {
        return $this->belongsToMany(Unit::class);
    }
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
    public function complaints(): HasMany // <--- ADD THIS RELATIONSHIP for Flutter app
    {
        return $this->hasMany(Complaint::class);
    }
}

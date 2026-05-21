<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon; // Import Carbon
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'photo',
        'password',
        'otp_code',        // <--- ADDED
        'otp_expires_at',  // <--- ADDED
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'otp_code',        // <--- ADDED
        'otp_expires_at',  // <--- ADDED
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'otp_expires_at' => 'datetime', // <--- ADDED
        ];
    }

    /**
     * Generate and save a new OTP for the user.
     */
    public function generateOtp(): int
    {
        $otp = rand(100000, 999999);
        $this->otp_code = $otp;
        $this->otp_expires_at = Carbon::now()->addMinutes(5); // OTP valid for 5 minutes
        $this->save();
        return $otp;
    }

    /**
     * Verify if the provided OTP is correct and not expired.
     */
    public function verifyOtp(string $otp): bool
    {
        return $this->otp_code === $otp && Carbon::now()->lt($this->otp_expires_at);
    }

    /**
     * Clear the OTP fields after successful verification or expiration.
     */
    public function clearOtp(): void
    {
        $this->otp_code = null;
        $this->otp_expires_at = null;
        $this->save();
    }

    /**
     * Get the full URL for the profile photo.
     */
    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}

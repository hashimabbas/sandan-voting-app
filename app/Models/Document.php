<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'unit_id',
        'name',          // Display name of the document
        'file_path',     // Stored path on disk (e.g., 'documents/my-contract.pdf')
        'file_name',     // Original file name (e.g., 'my-contract.pdf')
        'file_size',     // Size in bytes
        'file_mime_type',// MIME type (e.g., 'application/pdf')
        'type',          // Category of document (e.g., 'contract', 'receipt', 'report', 'other')
        'description',   // Optional description
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    // Relationships
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }
}

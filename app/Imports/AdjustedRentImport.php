<?php

namespace App\Imports;

use App\Models\Payment;
use App\Models\Unit;
use App\Models\Owner; // Make sure to import the Owner model
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log; // For logging warnings/errors

class AdjustedRentImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Get data from the row, using actual Excel column headers
            // Assuming Excel columns are 'unit_code', 'owner_id_no', 'amount', 'method'
            $excelUnitCode  = $this->sanitize($row['unit_code'] ?? null);
            $excelOwnerIdNo = $this->sanitize($row['owner_id_no'] ?? null);
            $amount         = $this->toFloat($row['amount'] ?? null);
            $method         = $this->sanitize($row['method'] ?? 'adjustment'); // Default method if not in Excel
            if (empty($excelUnitCode) || empty($excelOwnerIdNo) || $amount === null || $amount <= 0) {
                Log::warning("Skipped row due to missing essential data: " . json_encode($row->toArray()));
                continue; // skip invalid rows
            }

            // 1️⃣ Find the Owner model by owner_id_no
            $owner = Owner::where('owner_id_no', $excelOwnerIdNo)->first();
            if (!$owner) {
                Log::warning("Owner not found for owner_id_no: {$excelOwnerIdNo}. Skipping row: " . json_encode($row->toArray()));
                continue; // skip if owner doesn't exist
            }

            // 2️⃣ Find the Unit model by unit_code
            $unit = Unit::where('unit_code', $excelUnitCode)->first();
            if (!$unit) {
                Log::warning("Unit not found for unit_code: {$excelUnitCode}. Skipping row: " . json_encode($row->toArray()));
                continue; // skip if unit doesn't exist
            }

            try {
                // 3️⃣ Insert payment record
                // Use the primary key IDs from the found Owner and Unit models
                $payment = Payment::create([
                    'owner_id'     => $owner->id,     // This is the owner's primary key ID
                    'unit_id'      => $unit->id,      // This is the unit's primary key ID
                    'amount'       => $amount,
                    'method'       => $method,
                    'reference'    => 'xls-adjustment-' . uniqid(), // Generate a unique reference
                    'payment_date' => now(),
                    'meta'         => ['source' => 'adjusted_rent_import_by_code_and_id_no'],
                ]);

                // 4️⃣ Update Unit balance
                // Refresh the unit to ensure we're working with the latest 'received' value
                $unit->refresh();
                $unit->increment('received', $amount);
                $unit->balance = ($unit->total ?? 0) - ($unit->received ?? 0);
                $unit->save();

            } catch (\Exception $e) {
                Log::error("Failed to process row (DB error or model issue): " . json_encode($row->toArray()) . " | Error: " . $e->getMessage());
                continue; // skip row on error
            }
        }
    }

    /**
     * Converts various input types to float or null.
     */
    private function toFloat($value): ?float
    {
        if ($value === null) return null;
        if (is_numeric($value)) return (float) $value;

        $clean = preg_replace('/[^\d\.\-]/', '', trim((string) $value));
        return is_numeric($clean) ? (float) $clean : null;
    }

    /**
     * Sanitizes string values from Excel.
     */
    private function sanitize($value)
    {
        if ($value === null) return null;
        // Ensure string and trim whitespace.
        // mb_convert_encoding can be used if you consistently have encoding issues,
        // but often not strictly necessary if Excel is saving in UTF-8.
        return trim((string) $value);
        // If still getting encoding errors from Excel:
        // return mb_convert_encoding(trim((string) $value), 'UTF-8', 'auto');
    }
}

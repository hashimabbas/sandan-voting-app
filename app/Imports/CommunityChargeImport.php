<?php

namespace App\Imports;

use App\Models\Owner;
use App\Models\Unit;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CommunityChargeImport implements ToCollection, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            // Normalize keys and strip formulas
            $normalized = collect($row)->mapWithKeys(function ($value, $key) {
                // Convert year keys (2020 → y2020)
                if (is_numeric($key)) {
                    $key = "y{$key}";
                }

                // If the cell contains a formula (string starting with "="), ignore it
                if (is_string($value) && str_starts_with(trim($value), '=')) {
                    $value = null;
                }

                return [$key => $value];
            });

            $ownerIdNo = trim($normalized['id_no'] ?? '');
            $phone     = trim($normalized['contact_no'] ?? '');

            if (!$ownerIdNo || !($normalized['unit'] ?? null)) {
                continue; // skip invalid rows
            }

            // Find or create Owner
            $owner = Owner::where('owner_id_no', $ownerIdNo)
                          ->where('phone', $phone)
                          ->first();

            if (!$owner) {
                $owner = Owner::create([
                    'owner_id_no' => $ownerIdNo,
                    'name'  => $normalized['name_of_the_owner'] ?? null,
                    'phone'       => $phone,
                ]);
            } else {
                $owner->update([
                    'name' => $normalized['name_of_the_owner'] ?? $owner->name,
                ]);
            }

            // Extract years safely
            $y2020 = is_numeric($normalized['y2020'] ?? null) ? $normalized['y2020'] : 0;
            $y2021 = is_numeric($normalized['y2021'] ?? null) ? $normalized['y2021'] : 0;
            $y2022 = is_numeric($normalized['y2022'] ?? null) ? $normalized['y2022'] : 0;
            $y2023 = is_numeric($normalized['y2023'] ?? null) ? $normalized['y2023'] : 0;
            $y2024 = is_numeric($normalized['y2024'] ?? null) ? $normalized['y2024'] : 0;
            $y2025 = is_numeric($normalized['y2025'] ?? null) ? $normalized['y2025'] : 0;
            $y2026 = is_numeric($normalized['y2026'] ?? null) ? $normalized['y2026'] : 0;

            // Handle totals
            $total    = is_numeric($normalized['total'] ?? null)
                      ? $normalized['total']
                      : ($y2020 + $y2021 + $y2022 + $y2023 + $y2024 + $y2025 + $y2026);

            $received = is_numeric($normalized['received'] ?? null) ? $normalized['received'] : 0;
            $balance  = is_numeric($normalized['balance'] ?? null) ? $normalized['balance'] : ($total - $received);

            // Save Unit
            Unit::updateOrCreate(
                ['unit_code' => $normalized['unit']],
                [
                    'owner_id_no' => $owner->owner_id_no,
                    'y2020' => $y2020,
                    'y2021' => $y2021,
                    'y2022' => $y2022,
                    'y2023' => $y2023,
                    'y2024' => $y2024,
                    'y2025' => $y2025,
                    'y2026' => $y2026,
                    'total'   => $total,
                    'received'=> $received,
                    'balance' => $balance,
                ]
            );
        }
    }
}

<?php

namespace App\Imports;

use App\Models\Owner;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class OwnerImport implements ToCollection, WithHeadingRow
{
    public int $inserted = 0;
    public int $skipped = 0;
    public array $skippedPhones = [];

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            if (!isset($row['phone']) || !isset($row['name'])) {
                $this->skipped++;
                $this->skippedPhones[] = $row['phone'] ?? 'MISSING_PHONE';
                continue;
            }

            if (Owner::where('phone', $row['phone'])->exists()) {
                $this->skipped++;
                $this->skippedPhones[] = $row['phone'];
                continue;
            }

            Owner::create([
                'name'        => $row['name'],
                'phone'       => $row['phone'],
                'owner_id_no' => $row['owner_id_no'] ?? null,
            ]);

            $this->inserted++;
        }
    }
}

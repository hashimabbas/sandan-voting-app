<?php

namespace App\Imports;

use App\Models\Unit;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithUpserts;
use Maatwebsite\Excel\Concerns\SkipsOnFailure; // For error handling
use Maatwebsite\Excel\Validators\Failure;

class UnitsImport implements ToModel, WithHeadingRow, WithUpserts, SkipsOnFailure
{
    use Importable; // Importable trait is good for file handling

    /**
     * Specify the column to use for unique identification when upserting.
     */
    public function uniqueBy()
    {
        return 'unit_number';
    }

    /**
     * @param array $row
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function model(array $row)
    {
        // Map Excel columns to your Unit model attributes.
        // !! IMPORTANT: Adjust these keys to EXACTLY match your Excel headers (case-sensitive). !!
        // Based on your Excel screenshot and previous dd($row) output:
        return new Unit([
            'unit_number' => $row['unit'] ?? null,
            'owner_name' => $row['name_of_the_owner'] ?? null,
            'id_no' => $row['id_no'] ?? null,
            'contact_no' => $row['contact_no'] ?? null,

            // Mapping the yearly charges using integer keys
            'charge_2020' => isset($row[2020]) && is_numeric($row[2020]) ? (float) $row[2020] : null,
            'charge_2021' => isset($row[2021]) && is_numeric($row[2021]) ? (float) $row[2021] : null,
            'charge_2022' => isset($row[2022]) && is_numeric($row[2022]) ? (float) $row[2022] : null,
            'charge_2023' => isset($row[2023]) && is_numeric($row[2023]) ? (float) $row[2023] : null,
            'charge_2024' => isset($row[2024]) && is_numeric($row[2024]) ? (float) $row[2024] : null,
            'charge_2025' => isset($row[2025]) && is_numeric($row[2025]) ? (float) $row[2025] : null,
            'charge_2026' => isset($row[2026]) && is_numeric($row[2026]) ? (float) $row[2026] : null,

            // Safely handling the balance.
            'balance' => isset($row['balance']) && is_numeric($row['balance']) ? (float) $row['balance'] : null,
        ]);
    }

    /**
     * Handle failures during import.
     *
     * @param Failure ...$failures
     * @return void
     */
    public function onFailure(\Maatwebsite\Excel\Validators\Failure ...$failures)
    {
        // You can log these failures or display them to the user
        foreach ($failures as $failure) {
            Log::warning("Excel import failure: Row {$failure->row()} - Column {$failure->attribute()} - Error: {$failure->errors()[0]}");
            // You might want to collect these errors and return them in the response
        }
    }
}

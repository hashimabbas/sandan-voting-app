<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithUpserts;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $filePath = storage_path('app/data/community_charge_data.xlsx');

        if (!file_exists($filePath)) {
            Log::error("Excel file not found at: {$filePath}. Please place the file there.");
            return;
        }

        Log::info("Starting import from: {$filePath}");

        try {
            Excel::import(new class() implements
                ToModel,
                WithHeadingRow,
                WithUpserts
            {
                use Importable;

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
                    // Ensure to use the correct keys as observed in dd($row)
                    // Years are integers, other headers are strings.
                    return new Unit([
                        'unit_number' => $row['unit'] ?? null,
                        'owner_name'  => $row['name_of_the_owner'] ?? null,
                        'id_no'       => $row['id_no'] ?? null,
                        'contact_no'  => $row['contact_no'] ?? null,

                        // Yearly charges
                        'charge_2020' => isset($row[2020]) && is_numeric($row[2020]) ? round((float) $row[2020], 3) : null,
                        'charge_2021' => isset($row[2021]) && is_numeric($row[2021]) ? round((float) $row[2021], 3) : null,
                        'charge_2022' => isset($row[2022]) && is_numeric($row[2022]) ? round((float) $row[2022], 3) : null,
                        'charge_2023' => isset($row[2023]) && is_numeric($row[2023]) ? round((float) $row[2023], 3) : null,
                        'charge_2024' => isset($row[2024]) && is_numeric($row[2024]) ? round((float) $row[2024], 3) : null,
                        'charge_2025' => isset($row[2025]) && is_numeric($row[2025]) ? round((float) $row[2025], 3) : null,
                        'charge_2026' => isset($row[2026]) && is_numeric($row[2026]) ? round((float) $row[2026], 3) : null,

                        // Received is numeric in your dump
                        'received'    => isset($row['received']) && is_numeric($row['received']) ? round((float) $row['received'], 3) : null,

                        // Balance: skip if formula
                        'balance'     => isset($row['balance']) && is_numeric($row['balance']) ? round((float) $row['balance'], 3) : null,
                    ]);
                }
            }, $filePath);

            Log::info("Successfully imported units from {$filePath}");

        } catch (\Exception $e) {
            Log::error("Error during Excel import: " . $e->getMessage() . "\nFile: " . $e->getFile() . "\nLine: " . $e->getLine());
            Log::error("Seeder Exception Context: " . json_encode($e->getTrace()));
        }
    }
}

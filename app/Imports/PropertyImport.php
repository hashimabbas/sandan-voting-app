<?php

namespace App\Imports;

use App\Models\Building;
use App\Models\Unit;
use App\Models\Owner;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

class PropertyImport
{
    public int $inserted = 0;
    public int $updated = 0;
    public int $skipped = 0;
    public array $errors = [];

    protected $file;

    public function __construct($file)
    {
        $this->file = $file;
    }

    public function import(): void
    {
        try {
            $extension = $this->file->getClientOriginalExtension();
            $rows = [];

            if (strtolower($extension) === 'csv') {
                // Manual CSV reading to bypass ZipArchive issues
                if (($handle = fopen($this->file->getPathname(), "r")) !== FALSE) {
                    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                        $rows[] = $data;
                    }
                    fclose($handle);
                }
            } else {
                // Check if ZipArchive exists for XLSX/XLS
                if (!class_exists('ZipArchive')) {
                    $this->errors[] = "Server missing 'ZipArchive' extension. Please upload a .CSV file instead of .XLSX.";
                    return;
                }
                $spreadsheet = IOFactory::load($this->file->getPathname());
                $worksheet = $spreadsheet->getActiveSheet();
                $rows = $worksheet->toArray();
            }

            if (empty($rows) || count($rows) < 2) {
                $this->errors[] = "The file is empty or contains only headers.";
                return;
            }

            // Extract headers
            $headers = array_map(function($header) {
                return strtolower(trim($header));
            }, $rows[0]);

            $headerMap = array_flip($headers);

            $buildingKey = $this->findKey($headerMap, ['building_name', 'building', 'المبنى', 'اسم المبنى', 'building no']);
            $unitKey = $this->findKey($headerMap, ['unit_name', 'unit', 'الوحدة', 'اسم الوحدة', 'رقم الوحدة']);
            $ownerKey = $this->findKey($headerMap, ['owner_name', 'owner', 'المالك', 'اسم المالك', 'name of the owner']);
            $civilIdKey = $this->findKey($headerMap, ['civil_id', 'id_no', 'الرقم المدني', 'new owner id', 'owner id']);
            $phoneKey = $this->findKey($headerMap, ['phone', 'mobile', 'الهاتف', 'رقم الهاتف', 'phone #']);
            $statusKey = $this->findKey($headerMap, ['status', 'ownership_status', 'حالة الملكية', 'mulkiya status']);

            if ($buildingKey === null || $unitKey === null || $ownerKey === null || $civilIdKey === null) {
                $this->errors[] = "Missing required column headers. Required: Building, Unit, Owner Name, Civil ID.";
                return;
            }

            foreach (array_slice($rows, 1) as $index => $rowData) {
                DB::beginTransaction();
                try {
                    $buildingName = trim($rowData[$buildingKey] ?? '');
                    $unitName = trim($rowData[$unitKey] ?? '');
                    $ownerName = trim($rowData[$ownerKey] ?? '');
                    $civilId = trim($rowData[$civilIdKey] ?? '');
                    $phone = trim($rowData[$phoneKey] ?? '');
                    $status = trim($rowData[$statusKey] ?? 'pending');

                    if (empty($buildingName) || empty($unitName) || empty($ownerName) || empty($civilId)) {
                        $this->skipped++;
                        DB::rollBack();
                        continue;
                    }

                    $building = Building::firstOrCreate(['name' => $buildingName]);

                    $unit = Unit::updateOrCreate(
                        ['building_id' => $building->id, 'unit_name' => $unitName],
                        ['ownership_status' => $status, 'unit_code' => $unitName]
                    );

                    $owner = Owner::updateOrCreate(
                        ['civil_id' => $civilId],
                        [
                            'name' => $ownerName,
                            'phone' => $phone,
                            'owner_id_no' => $civilId,
                        ]
                    );

                    if (!$unit->owners()->where('owner_id', $owner->id)->exists()) {
                        $unit->owners()->attach($owner->id);
                    }

                    DB::commit();
                    $this->inserted++;

                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->skipped++;
                    $this->errors[] = "Row " . ($index + 2) . ": " . $e->getMessage();
                }
            }

        } catch (\Exception $e) {
            $this->errors[] = "An error occurred: " . $e->getMessage();
            Log::error("PropertyImport Error: " . $e->getMessage());
        }
    }

    private function findKey(array $headerMap, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $normalized = strtolower(trim($name));
            if (isset($headerMap[$normalized])) {
                return $headerMap[$normalized];
            }
            // Also try to find by substring for Arabic
            foreach ($headerMap as $h => $idx) {
                if (str_contains($h, $normalized)) {
                    return $idx;
                }
            }
        }
        return null;
    }
}

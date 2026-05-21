<?php

namespace App\Imports;

use App\Models\Voter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\IOFactory;

class VoterImport
{
    public int $inserted = 0;
    public int $updated = 0;
    public int $skipped = 0;
    public array $errors = [];

    protected int $electionId;
    protected $file;

    /**
     * @param int $electionId
     * @param \Illuminate\Http\UploadedFile $file
     */
    public function __construct(int $electionId, $file)
    {
        $this->electionId = $electionId;
        $this->file = $file;
    }

    public function import(): void
    {
        try {
            $extension = $this->file->getClientOriginalExtension();
            $rows = [];

            if (strtolower($extension) === 'csv') {
                if (($handle = fopen($this->file->getPathname(), "r")) !== FALSE) {
                    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                        $rows[] = $data;
                    }
                    fclose($handle);
                }
            } else {
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

            // Flexible column mapping based on the provided file structure
            $voterIdKey = $this->findKey($headerMap, ['new owner id', 'owner id', 'voter_id', 'id_no', 'civil_id', 'الرقم المدني', 'الرقم الموحد', 'voter id no']);
            $nameKey = $this->findKey($headerMap, ['name of the owner', 'name', 'voter_name', 'الاسم', 'اسم المصوت', 'shareholder name']);
            $phoneKey = $this->findKey($headerMap, ['phone #', 'phone', 'mobile', 'الهاتف', 'رقم الهاتف']);
            $unitsKey = $this->findKey($headerMap, ['units', 'number_of_units', 'عدد الوحدات', 'عدد الأصوات', 'unit count']);
            $buildingKey = $this->findKey($headerMap, ['building no', 'building', 'المبنى', 'رقم المبنى']);
            $unitNameKey = $this->findKey($headerMap, ['unit', 'unit name', 'unit no', 'رقم الوحدة', 'الوحدة']);
            $statusKey = $this->findKey($headerMap, ['mulkiya status', 'status', 'حالة الملكية']);

            if ($voterIdKey === null || $nameKey === null) {
                $this->errors[] = "Missing required column headers. We need at least 'Owner ID' and 'Name'.";
                return;
            }

            // Group by Voter ID to handle multiple units per person (if units column is missing)
            $voterDataMap = [];
            
            foreach (array_slice($rows, 1) as $index => $rowData) {
                $voterIdNo = trim($rowData[$voterIdKey] ?? '');
                $name = trim($rowData[$nameKey] ?? '');
                $phone = trim($rowData[$phoneKey] ?? '');
                $status = trim($rowData[$statusKey] ?? 'transferred'); 
                $buildingNo = trim($rowData[$buildingKey] ?? '');
                $unitName = trim($rowData[$unitNameKey] ?? '');

                // Validation
                if (empty($voterIdNo) || empty($name)) {
                    continue;
                }

                // Filter by transferred status
                if ($statusKey !== null) {
                    // If there is a status column, we strictly enforce it.
                    $rawStatus = trim($rowData[$statusKey] ?? '');
                    $normStatus = strtolower($rawStatus);
                    if ($normStatus !== 'transferred' && $normStatus !== 'محولة') {
                        continue; // Skip ineligible units (including blank ones)
                    }
                }

                if (!isset($voterDataMap[$voterIdNo])) {
                    $voterDataMap[$voterIdNo] = [
                        'name' => $name,
                        'phone' => $phone,
                        'units' => 0,
                        'building_no' => $buildingNo,
                        'unit_name' => $unitName,
                        'mulkiya_status' => $status
                    ];
                }

                // If a "Units" column exists, use it. Otherwise, count 1 unit per row.
                if ($unitsKey !== null && !empty($rowData[$unitsKey])) {
                    $voterDataMap[$voterIdNo]['units'] += (int) $rowData[$unitsKey];
                } else {
                    $voterDataMap[$voterIdNo]['units'] += 1;
                }
                
                // If we have multiple rows for same owner, concatenate unit names if they differ
                if (!empty($unitName) && strpos($voterDataMap[$voterIdNo]['unit_name'], $unitName) === false) {
                    $voterDataMap[$voterIdNo]['unit_name'] .= ($voterDataMap[$voterIdNo]['unit_name'] ? ', ' : '') . $unitName;
                }
                if (!empty($buildingNo) && strpos($voterDataMap[$voterIdNo]['building_no'], $buildingNo) === false) {
                    $voterDataMap[$voterIdNo]['building_no'] .= ($voterDataMap[$voterIdNo]['building_no'] ? ', ' : '') . $buildingNo;
                }
            }

            if (empty($voterDataMap)) {
                $this->errors[] = "No valid records found in the file (check if IDs and Names are present).";
                return;
            }

            // Perform DB inserts/updates
            foreach ($voterDataMap as $idNo => $data) {
                DB::beginTransaction();
                try {
                    $voter = Voter::updateOrCreate(
                        [
                            'election_id' => $this->electionId,
                            'voter_id_no' => $idNo
                        ],
                        [
                            'name' => $data['name'],
                            'phone' => $data['phone'],
                            'number_of_units' => $data['units'],
                            'building_no' => $data['building_no'],
                            'unit_name' => $data['unit_name'],
                            'mulkiya_status' => $data['mulkiya_status'],
                        ]
                    );

                    if ($voter->wasRecentlyCreated) {
                        $this->inserted++;
                    } else {
                        $this->updated++;
                    }

                    DB::commit();
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->errors[] = "Error saving Voter ID {$idNo}: " . $e->getMessage();
                }
            }

        } catch (\Exception $e) {
            $this->errors[] = "An error occurred during import: " . $e->getMessage();
            Log::error("VoterImport Error: " . $e->getMessage());
        }
    }

    private function findKey(array $headerMap, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $normalized = strtolower(trim($name));
            if (isset($headerMap[$normalized])) {
                return $headerMap[$normalized];
            }
            foreach ($headerMap as $h => $idx) {
                if (str_contains($h, $normalized)) {
                    return $idx;
                }
            }
        }
        return null;
    }
}

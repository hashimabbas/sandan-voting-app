<?php

namespace App\Imports;

use App\Models\Owner; // Still used to link unit to owner, but not creating owners from tenant data
use App\Models\Unit;
use App\Models\Tenant; // <--- ADD THIS IMPORT
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; // For snake_case, Hash, Carbon

class RentReceivableImport implements ToCollection, WithHeadingRow
{
    public int $unitsInserted = 0;
    public int $unitsUpdated = 0;
    public int $tenantsInserted = 0; // <--- NEW
    public int $tenantsUpdated = 0;   // <--- NEW
    public int $ownersMatchedForUnits = 0; // <--- Renamed
    public int $ownersNotFoundForUnits = 0; // <--- Renamed
    public int $skippedRows = 0;
    public array $errors = [];

    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        $currentYear = (int)\Carbon\Carbon::now()->format('Y');

        foreach ($rows as $row) {
            $normalizedRow = collect($row)->mapWithKeys(function ($value, $key) {
                return [Str::snake(trim($key)) => trim($value)];
            });

            // --- Extract data from Excel columns ---
            $butId           = $normalizedRow['but_id'] ?? null;
            $tenantName      = $normalizedRow['tenant_name'] ?? null;
            $contact         = $normalizedRow['contact'] ?? null; // Tenant's phone number
            $rentAmount      = $this->toFloat($normalizedRow['rent_amount'] ?? 0); // Monthly rent
            $numberOfMonths  = (int)($normalizedRow['number_of_months'] ?? 0);
            $totalAmount     = $this->toFloat($normalizedRow['total_amount'] ?? 0); // Total amount for period
            $leaseStartDate  = $normalizedRow['lease_start_date'] ?? null;
            $leaseEndDate    = $normalizedRow['lease_end_date'] ?? null;
            $remarks         = $normalizedRow['remarks'] ?? null; // New field

            // Essential validation for a row
            if (empty($butId) || empty($tenantName) || empty($contact)) {
                $this->skippedRows++;
                $this->errors[] = "Skipped row (missing BUT_ID, Tenant_Name, or Contact): " . json_encode($normalizedRow->toArray());
                continue;
            }

            // --- Database Transaction for Atomicity ---
            try {
                DB::transaction(function () use (
                    $butId, $tenantName, $contact, $rentAmount, $numberOfMonths, $totalAmount,
                    $leaseStartDate, $leaseEndDate, $remarks, $currentYear
                ) {
                    // --- 1. Find or Create/Update Unit ---
                    $unit = Unit::where('unit_code', $butId)->first();
                    $unitId = $unit->id ?? null; // To link tenant later

                    // Try to link unit to an EXISTING Owner by matching Tenant's Contact with Owner's Phone
                    $owner = Owner::where('phone', $contact)->first();
                    $ownerIdNoForUnit = $owner->owner_id_no ?? null;

                    if ($owner) {
                        $this->ownersMatchedForUnits++;
                    } else {
                        $this->ownersNotFoundForUnits++;
                        Log::warning("RentReceivableImport: No existing owner found for contact {$contact}. Unit '{$butId}' will have no owner linked.");
                    }

                    // Calculate yearly amounts (logic remains simplified for now)
                    $y2020 = $y2021 = $y2022 = $y2023 = $y2024 = $y2025 = $y2026 = 0;
                    $calculatedTotal = $totalAmount;

                    $targetYear = $currentYear;
                    if ($leaseStartDate && \Carbon\Carbon::parse($leaseStartDate)->isValid()) {
                        $leaseStartCarbon = \Carbon\Carbon::parse($leaseStartDate);
                        $targetYear = (int)$leaseStartCarbon->format('Y');
                    }

                    if ($targetYear >= 2020 && $targetYear <= 2026) {
                        ${'y' . $targetYear} = $calculatedTotal;
                    } else {
                        ${'y' . $currentYear} = $calculatedTotal;
                    }

                    $unitData = [
                        'owner_id_no' => $ownerIdNoForUnit, // Can be null if no owner found
                        'y2020' => $y2020,
                        'y2021' => $y2021,
                        'y2022' => $y2022,
                        'y2023' => $y2023,
                        'y2024' => $y2024,
                        'y2025' => $y2025,
                        'y2026' => $y2026,
                        'total' => $calculatedTotal,
                        'received' => 0,
                        'balance' => $calculatedTotal,
                    ];

                    if (!$unit) {
                        $unit = Unit::create(array_merge(['unit_code' => $butId], $unitData));
                        $this->unitsInserted++;
                    } else {
                        $unit->update($unitData);
                        $this->unitsUpdated++;
                    }
                    $unitId = $unit->id; // Ensure unitId is set for tenant linking


                    // --- 2. Find or Create/Update Tenant ---
                    // Assuming phone number is a unique identifier for a tenant
                    $tenant = Tenant::where('phone', $contact)->first();

                    // Convert dates safely
                    $parsedLeaseStartDate = $leaseStartDate ? (\Carbon\Carbon::parse($leaseStartDate)->isValid() ? \Carbon\Carbon::parse($leaseStartDate) : null) : null;
                    $parsedLeaseEndDate = $leaseEndDate ? (\Carbon\Carbon::parse($leaseEndDate)->isValid() ? \Carbon\Carbon::parse($leaseEndDate) : null) : null;


                    $tenantData = [
                        'name' => $tenantName,
                        'unit_id' => $unitId, // Link tenant to the unit
                        'lease_start_date' => $parsedLeaseStartDate,
                        'lease_end_date' => $parsedLeaseEndDate,
                        'rent_amount' => $rentAmount,
                        'remarks' => $remarks,
                        // email and deposit_amount not in Excel, will be null/default
                    ];

                    if (!$tenant) {
                        Tenant::create(array_merge(['phone' => $contact], $tenantData));
                        $this->tenantsInserted++;
                    } else {
                        $tenant->update($tenantData); // Update existing tenant
                        $this->tenantsUpdated++;
                    }
                });
            } catch (\Exception $e) {
                $this->skippedRows++;
                $this->errors[] = "Error processing row for BUT_ID '{$butId}': " . $e->getMessage() . " - Row: " . json_encode($normalizedRow->toArray());
                Log::error("RentReceivableImport: Row processing error: " . $e->getMessage(), ['row' => $normalizedRow->toArray()]);
            }
        }
    }

    /**
     * Converts various input types to float.
     */
    private function toFloat($value): float
    {
        if ($value === null || $value === '') {
            return 0.000;
        }
        $cleanedValue = str_replace(',', '', (string) $value);
        if (!is_numeric($cleanedValue)) {
            return 0.000;
        }
        return (float) $cleanedValue;
    }
}

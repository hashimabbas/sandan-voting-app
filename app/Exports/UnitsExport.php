<?php

namespace App\Exports;

use App\Models\Unit;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class UnitsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $units;

    public function __construct(Collection $units)
    {
        $this->units = $units;
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        return $this->units;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Unit ID',
            'Unit Code',
            'Owner Name',
            'Owner Phone',
            'Total Claims (OMR)',
            'Received (OMR)',
            'Balance (OMR)',
            'Y2020',
            'Y2021',
            'Y2022',
            'Y2023',
            'Y2024',
            'Y2025',
            'Y2026',
        ];
    }

    /**
     * @param mixed $unit
     * @return array
     */
    public function map($unit): array
    {
        return [
            $unit->id,
            $unit->unit_code,
            $unit->owner->name ?? 'N/A',
            $unit->owner->phone ?? 'N/A',
            number_format($unit->total, 3),
            number_format($unit->received, 3),
            number_format($unit->balance, 3),
            number_format($unit->y2020, 3),
            number_format($unit->y2021, 3),
            number_format($unit->y2022, 3),
            number_format($unit->y2023, 3),
            number_format($unit->y2024, 3),
            number_format($unit->y2025, 3),
            number_format($unit->y2026, 3),
        ];
    }
}

<?php

namespace App\Exports;

use App\Models\Owner;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class OwnersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $owners;

    public function __construct(Collection $owners)
    {
        $this->owners = $owners;
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        return $this->owners;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Owner ID',
            'Name',
            'Phone',
            'ID No.',
            'Total Units',
            'Total Balance (OMR)',
        ];
    }

    /**
     * @param mixed $owner
     * @return array
     */
    public function map($owner): array
    {
        return [
            $owner->id,
            $owner->name,
            $owner->phone,
            $owner->owner_id_no ?? 'N/A',
            $owner->units_count, // From withCount('units')
            number_format($owner->total_balance, 3), // From withSum('units as total_balance')
        ];
    }
}

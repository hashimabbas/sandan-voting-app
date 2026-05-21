<?php

namespace App\Exports;

use App\Models\Payment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class PaymentsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $payments;

    public function __construct(Collection $payments)
    {
        $this->payments = $payments;
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        return $this->payments;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'Payment ID',
            'Date',
            'Owner Name',
            'Owner Phone',
            'Unit Code',
            'Method',
            'Reference',
            'Amount (OMR)',
        ];
    }

    /**
     * @param mixed $payment
     * @return array
     */
    public function map($payment): array
    {
        return [
            $payment->id,
            $payment->payment_date ? \Carbon\Carbon::parse($payment->payment_date)->format('Y-m-d') : 'N/A',
            $payment->owner->name ?? 'N/A',
            $payment->owner->phone ?? 'N/A',
            $payment->unit->unit_code ?? 'N/A',
            $payment->method,
            $payment->reference ?? 'N/A',
            number_format($payment->amount, 3), // Format amount for consistency
        ];
    }
}

import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

// Re-using the Unit interface
interface Unit {
    id: number;
    unit_code: string;
    // Allow balance to come as string, number, or null/undefined, and we'll handle conversion
    balance: number | string | null | undefined;
}

interface ThawaniPaymentFormProps {
    units: Unit[]; // Units belonging to the owner
}

export function ThawaniPaymentForm({ units }: ThawaniPaymentFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        unit_id: '',
        amount: '',
    });

    const selectedUnit = units.find(unit => unit.id === Number(data.unit_id));

    // --- Defensive conversion for selectedUnitBalance ---
    let selectedUnitBalance: number = 0; // Initialize as a number

    if (selectedUnit && selectedUnit.balance !== null && selectedUnit.balance !== undefined) {
        const parsedBalance = Number(selectedUnit.balance); // Attempt conversion
        if (isFinite(parsedBalance)) { // Check if it's a finite number (not NaN, Infinity)
            selectedUnitBalance = parsedBalance;
        }
    }
    // --- End defensive conversion ---


    // --- DEBUGGING: Keep this line to verify the type and value at the critical point ---
    console.log("DEBUG_THAWANI_FORM: selectedUnit:", selectedUnit);
    console.log("DEBUG_THAWANI_FORM: selectedUnit.balance (raw from object):", selectedUnit?.balance);
    console.log("DEBUG_THAWANI_FORM: selectedUnitBalance (processed number):", selectedUnitBalance);
    console.log("DEBUG_THAWANI_FORM: Type of selectedUnitBalance:", typeof selectedUnitBalance);
    // --- END DEBUGGING ---


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // ✅ Only talk to YOUR backend here
            const response = await fetch('/owner/payments/thawani/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content,
                },
                body: JSON.stringify({
                    unit_id: data.unit_id,
                    amount: data.amount,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Redirect URL from backend:", result.redirectUrl);

            // ✅ IMPORTANT: Only use window.location to go to Thawani
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                alert('Redirect URL missing.');
            }

        } catch (error) {
            console.error("❌ Error initiating Thawani payment:", error);
            alert('Failed to initiate payment. Please try again.');
        }
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="unit_id" className="font-medium">Select Unit</Label>
                <Select
                    onValueChange={(value) => {
                        setData('unit_id', value);
                        const unit = units.find(u => u.id === Number(value));

                        let unitBalanceToSet: number = 0;
                        if (unit && unit.balance !== null && unit.balance !== undefined) {
                            const parsedUnitBalance = Number(unit.balance);
                            if (isFinite(parsedUnitBalance)) {
                                unitBalanceToSet = parsedUnitBalance;
                            }
                        }

                        if (unit && unitBalanceToSet > 0) {
                            setData('amount', unitBalanceToSet.toFixed(3)); // Ensure toFixed is on a number
                        } else {
                            setData('amount', '');
                        }
                    }}
                    value={data.unit_id.toString()}
                    name="unit_id"
                >
                    <SelectTrigger id="unit_id" className="w-full">
                        <SelectValue placeholder="Choose a unit to pay for" />
                    </SelectTrigger>
                    <SelectContent>
                        {units.length > 0 ? (
                            units.map((unit) => {
                                // Defensive conversion for display in dropdown items
                                let displayBalance: number = 0;
                                if (unit.balance !== null && unit.balance !== undefined) {
                                    const parsedDisplayBalance = Number(unit.balance);
                                    if (isFinite(parsedDisplayBalance)) {
                                        displayBalance = parsedDisplayBalance;
                                    }
                                }

                                return (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                        {unit.unit_code} (Balance: {displayBalance.toFixed(3)}) {/* Ensure toFixed is on a number */}
                                    </SelectItem>
                                );
                            })
                        ) : (
                            <SelectItem value="no-units" disabled>No units available</SelectItem>
                        )}
                    </SelectContent>
                </Select>
                <InputError message={errors.unit_id} className="mt-2" />
            </div>

            {data.unit_id && (
                <div>
                    <Label htmlFor="amount" className="font-medium">Amount to Pay</Label>
                    <Input
                        id="amount"
                        type="number"
                        step="0.001"
                        min="0.1"
                        // LINE 81 (approximately in your original code):
                        // selectedUnitBalance is now guaranteed to be a number (0 or positive finite number).
                        // toFixed(3) is safely called on a number.
                        max={selectedUnitBalance > 0 ? selectedUnitBalance.toFixed(3) : undefined}
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        placeholder="Enter amount"
                        name="amount"
                        className="w-full"
                    />
                    {selectedUnitBalance > 0 && (
                        <p className="text-sm text-gray-500 mt-1">Outstanding Balance for selected unit: {selectedUnitBalance.toFixed(3)}</p>
                    )}
                    <InputError message={errors.amount} className="mt-2" />
                </div>
            )}

            <Button
                type="submit"
                disabled={processing || !data.unit_id || !data.amount || Number(data.amount) <= 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
                {processing ? 'Processing Payment...' : 'Pay Now with Thawani'}
            </Button>
        </form>
    );
}

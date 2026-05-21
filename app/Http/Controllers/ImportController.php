<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\CommunityChargeImport;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\RentAdjustmentImport;

class ImportController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);

        Excel::import(new CommunityChargeImport, $request->file('file'));

        return response()->json(['message' => 'File imported successfully']);
    }

    // public function importRentAdjustments(Request $request)
    // {
    //     $request->validate(['file' => 'required|mimes:xlsx,xls,csv|max:4096']);

    //     try {
    //         Excel::import(new RentAdjustmentImport(), $request->file('file'));
    //         return redirect()->route('admin_units_index')->with('success', 'Rent adjustments imported successfully.');
    //     } catch (\Throwable $e) {
    //         return redirect()->back()->with('error', 'Import failed: ' . $e->getMessage());
    //     }
    // }
}

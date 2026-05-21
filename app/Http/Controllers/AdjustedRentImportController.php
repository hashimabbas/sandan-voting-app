<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\AdjustedRentImport;

class AdjustedRentImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls',
        ]);

        Excel::import(new AdjustedRentImport, $request->file('file'));

        return back()->with('success', '✅ Adjusted rent payments imported successfully.');
    }
}

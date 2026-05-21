<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\PropertyImport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Import/Index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
        ]);

        $import = new PropertyImport($request->file('file'));
        $import->import();

        if (count($import->errors) > 0) {
            return back()->with('error', 'Import completed with errors. Errors: ' . implode(', ', array_slice($import->errors, 0, 5)));
        }

        return back()->with('success', "Import successful: {$import->inserted} records processed.");
    }
}

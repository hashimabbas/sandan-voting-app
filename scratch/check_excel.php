<?php
require 'vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

$file = 'C:/Users/User/Desktop/work/Sandan Payment System/voting-system/for_voting_system.xlsx';
if (!file_exists($file)) {
    echo "File not found\n";
    exit;
}

$spreadsheet = IOFactory::load($file);
$worksheet = $spreadsheet->getActiveSheet();
$rows = $worksheet->toArray();

if (!empty($rows)) {
    print_r($rows[0]);
}

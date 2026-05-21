<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$voters = \App\Models\Voter::where('name', 'like', '%SIYABI%')->get()->toArray();
file_put_contents('siyabi_dump.json', json_encode($voters, JSON_PRETTY_PRINT));
echo 'Done';

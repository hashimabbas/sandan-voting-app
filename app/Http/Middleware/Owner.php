<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class Owner
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('owner')->check()) {
            return redirect()->route('vote_show_voter_id_form'); // fallback to login page
        }

        return $next($request);
    }
}

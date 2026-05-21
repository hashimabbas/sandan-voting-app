<?php

namespace App\Services;

// CORRECTED USE STATEMENT: Adjust this based on the ACTUAL client class namespace
use Ultramsg\WhatsApp\WhatsAppApi as UltramsgClient; // Using an alias for clarity

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class UltramsgSmsService
{
    protected $client;

    public function __construct()
    {
        $instanceId = Config::get('ultramsg.instance_id');
        $apiToken = Config::get('ultramsg.api_token');

        if (!$instanceId || !$apiToken) {
            throw new \Exception("Ultramsg API credentials not configured. Please check your .env file and config/ultramsg.php.");
        }

        // Instantiate using the correct class and namespace
        $this->client = new UltramsgClient($instanceId, $apiToken); // Using the alias here
    }

    /**
     * Send an SMS message.
     *
     * @param string $to The recipient's phone number (e.g., "14155552671").
     * @param string $message The message text.
     * @return bool True on success, false on failure.
     */
    public function sendMessage(string $to, string $message): bool
    {
        try {
            // The method to send messages might be different.
            // Check the documentation for how to send a message using the $client object.
            // It might be: $this->client->sendChatMessage(...) or similar.
            // The example 'post('sendMessage', ...)' might be incorrect if the SDK wraps this.

            // Let's assume a method like sendChatMessage exists and takes parameters:
            // Check the Ultramsg PHP SDK documentation for the exact method and parameters.
            $response = $this->client->sendChatMessage([
                'to'    => $to,
                'message' => $message,
                // Potentially other parameters like 'type' => 'text'
            ]);

            // The response structure from Ultramsg will dictate how to check success.
            // It's usually a JSON object with a status or code.
            // For example, if response['status'] == 'success' or response['code'] == 200
            if (isset($response['status']) && $response['status'] === 'success') { // Adjust based on actual response
                Log::info("Ultramsg SMS sent successfully to {$to}.");
                return true;
            } else {
                // Log the actual error response for debugging
                Log::error("Ultramsg SMS sending failed for {$to}. Response: " . json_encode($response));
                return false;
            }
        } catch (\Exception $e) {
            Log::error("Exception sending Ultramsg SMS to {$to}: " . $e->getMessage());
            return false;
        }
    }
}

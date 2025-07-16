<?php

namespace Elementor\Modules\Design_System_Generator;

class Claude_API {
    private $api_key;
    private $api_version;
    private $base_url = 'https://api.anthropic.com/v1';

    public function __construct($api_key = null, $api_version = '2023-06-01') {
        // If no API key provided, try to get from environment
        $this->api_key = $api_key ?? getenv('CLAUDE_API_KEY');
        $this->api_version = $api_version ?? getenv('CLAUDE_API_VERSION') ?? '2023-06-01';

        if (!$this->api_key) {
            throw new \Exception('Claude API key is required. Set CLAUDE_API_KEY environment variable or pass it to the constructor.');
        }
    }

    /**
     * Send a message to Claude and get the response
     *
     * @param string $message The message to send
     * @param array $options Additional options for the API call
     * @return array The API response
     * @throws \Exception
     */
    public function send_message($message, $options = []) {
        $default_options = [
            'model' => 'claude-sonnet-4-20250514',
            'max_tokens' => 1024,
        ];

        $options = array_merge($default_options, $options);

        $payload = [
            'model' => $options['model'],
            'max_tokens' => $options['max_tokens'],
            'messages' => [
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ]
        ];

        return $this->make_request('messages', $payload);
    }

    /**
     * Make an HTTP request to the Claude API
     *
     * @param string $endpoint The API endpoint
     * @param array $payload The request payload
     * @return array The API response
     * @throws \Exception
     */
    private function make_request($endpoint, $payload) {
        $url = "{$this->base_url}/{$endpoint}";

        // If we're not in WordPress, use curl directly
        if (!function_exists('wp_remote_post')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'x-api-key: ' . $this->api_key,
                'anthropic-version: ' . $this->api_version,
                'content-type: application/json',
            ]);
            
            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);

            if ($error) {
                throw new \Exception('Failed to connect to Claude API: ' . $error);
            }

            $data = json_decode($response, true);
            if (!$data) {
                throw new \Exception('Failed to parse Claude API response');
            }

            return $data;
        }

        // WordPress environment
        $args = [
            'headers' => [
                'x-api-key' => $this->api_key,
                'anthropic-version' => $this->api_version,
                'content-type' => 'application/json',
            ],
            'body' => json_encode($payload),
            'method' => 'POST',
            'timeout' => 30,
        ];

        $response = wp_remote_post($url, $args);

        if (is_wp_error($response)) {
            throw new \Exception('Failed to connect to Claude API: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!$data) {
            throw new \Exception('Failed to parse Claude API response');
        }

        return $data;
    }
}

// // Test code - will run if file is accessed directly
// if (php_sapi_name() === 'cli') {
//     try {
//         error_log("\nStarting Claude API test...");
//         error_log("============================\n");

//         // Load environment variables from .env file
//         $env_path = __DIR__ . '/.env';
//         error_log("Looking for .env file at: " . $env_path);
        
//         if (file_exists($env_path)) {
//             error_log(".env file found!");
//             $env_lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
//             foreach ($env_lines as $line) {
//                 if (strpos($line, '#') === 0) continue; // Skip comments
//                 list($key, $value) = explode('=', $line, 2);
//                 putenv(trim($key) . '=' . trim($value));
//             }
//             error_log("Environment variables loaded");
//         } else {
//             error_log("WARNING: .env file not found!");
//         }

//         // Create instance of Claude API
//         $claude = new Claude_API();
//         error_log("Claude API instance created successfully");

//         // Send test message
//         $test_message = "Hello Claude! This is a test message. Please respond with a short greeting.";
//         error_log("Sending test message: " . $test_message);
        
//         $response = $claude->send_message($test_message, [
//             'max_tokens' => 100 // Limiting response length for test
//         ]);

//         // Output response
//         error_log("\nTest Response:");
//         error_log("===============");
//         error_log(print_r($response, true));
//         error_log("\nTest completed successfully!");

//     } catch (\Exception $e) {
//         error_log("\nError occurred during test:");
//         error_log($e->getMessage());
//         error_log("\nStack trace:");
//         error_log($e->getTraceAsString());
//     }
// } 
<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Response;

require_once __DIR__ . '/handler.php';

add_action('rest_api_init', function () {
    register_rest_route('elementor/v2', '/css-converter', [
        'methods' => 'POST',
        'callback' => 'elementor_css_converter_api_handler',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('elementor/v2', '/css-converter/docs', [
        'methods' => 'GET',
        'callback' => 'elementor_css_converter_api_docs',
        'permission_callback' => '__return_true',
    ]);
});

define('ELEMENTOR_CSS_CONVERTER_API_KEY', 'changeme-hardcoded-key'); // TODO: Update for production

function elementor_css_converter_api_handler($request) {
    $api_key = $request->get_header('X-API-Key');
    if ($api_key !== ELEMENTOR_CSS_CONVERTER_API_KEY) {
        return new WP_REST_Response(['error' => 'Unauthorized'], 401);
    }
    $handler = new CssConverterHandler();
    $result = $handler->handleRequest($request);
    if (isset($result['error'])) {
        return new WP_REST_Response($result, 400);
    }
    return new WP_REST_Response($result, 200);
}

function elementor_css_converter_api_docs($request) {
    $openapi_path = __DIR__ . '/openapi.yaml';
    if (!file_exists($openapi_path)) {
        return new WP_REST_Response(['error' => 'API documentation not implemented'], 501);
    }
    $yaml = file_get_contents($openapi_path);
    return new WP_REST_Response($yaml, 200, ['Content-Type' => 'application/yaml']);
} 
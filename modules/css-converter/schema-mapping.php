<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function elementor_css_converter_map_css_to_props($tag, $css, $schema) {
    $props = [];
    // Parse CSS string for background-color and color
    $cssProps = [];
    foreach (explode(';', $css) as $declaration) {
        $parts = explode(':', $declaration, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $cssProps[$key] = $value;
        }
    }
    // Map background-color
    if (isset($cssProps['background-color']) && isset($schema['background'])) {
        $props['background'] = [
            'color' => $cssProps['background-color'],
        ];
    }
    // Map color
    if (isset($cssProps['color']) && isset($schema['color'])) {
        $props['color'] = $cssProps['color'];
    }
    return $props;
} 
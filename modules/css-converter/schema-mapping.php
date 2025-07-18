<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\CssConverters\CssPropertyConverterRegistry;

function elementor_css_converter_map_css_to_props($tag, $css, $schema) {
    $props = [];
    $cssProps = [];
    foreach (explode(';', $css) as $declaration) {
        $parts = explode(':', $declaration, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $cssProps[$key] = $value;
        }
    }
    $registry = new CssPropertyConverterRegistry();
    foreach ($cssProps as $property => $value) {
        $converter = $registry->getConverter($property);
        if ($converter) {
            $converted = $converter->convert($value, $schema);
            $props = array_merge($props, $converted);
        }
    }
    return $props;
} 
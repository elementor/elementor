<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/css-converters/css-property-converter-registry.php';

use Elementor\Modules\CssConverter\CssConverters\CssPropertyConverterRegistry;

function elementor_css_converter_map_css_to_props( $tag, $css, $schema ) {
	$props = [];
	$css_props = [];
	foreach ( explode( ';', $css ) as $declaration ) {
		$parts = explode( ':', $declaration, 2 );
		if ( count( $parts ) === 2 ) {
			$key = trim( $parts[0] );
			$value = trim( $parts[1] );
			$css_props[ $key ] = $value;
		}
	}
    $registry = new CssPropertyConverterRegistry();
    foreach ( $css_props as $property => $value ) {
        $converter = $registry->get_converter( $property );
		if ( $converter ) {
			$converted = $converter->convert( $value, $schema );
			$props = array_merge( $props, $converted );
		}
	}
	return $props;
}

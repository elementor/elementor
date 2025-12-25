<?php

namespace Elementor\Modules\AtomicConverters;

use Elementor\Modules\AtomicConverters\Css\Converter_Registry;
use Elementor\Modules\AtomicConverters\Css\Property_Converter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Converter {
	private const PATTERN_CSS_DECLARATION = '/([a-zA-Z0-9-]+)\s*:\s*([^;]+);?/';

	private Converter_Registry $registry;

	public function __construct( Converter_Registry $registry ) {
		$this->registry = $registry;
	}

	public function convert( array $params ): array {
		$css_string = $params['cssString'] ?? '';

		$properties = $this->parse_css_string( $css_string );
		$result = $this->convert_properties_to_atomic( $properties );

		return $result;
	}

	private function parse_css_string( string $css_string ): array {
		$properties = [];
		$pattern = self::PATTERN_CSS_DECLARATION;

		if ( preg_match_all( $pattern, $css_string, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$property = trim( $match[1] );
				$value = trim( $match[2] );
				$properties[ $property ] = $value;
			}
		}

		return $properties;
	}

	private function convert_properties_to_atomic( array $properties ): array {
		$props = [];

		foreach ( $properties as $property => $value ) {
			$converter = $this->get_converter_for_property( $property );
			if ( null !== $converter ) {
				$converted = $converter->convert( $property, $value );
				if ( null !== $converted ) {
					$props[ $property ] = $converted;
				}
			}
		}

		return [
			'props' => (object) $props,
		];
	}

	private function get_converter_for_property( string $property ): ?Property_Converter_Interface {
		return $this->registry->resolve( $property );
	}
}

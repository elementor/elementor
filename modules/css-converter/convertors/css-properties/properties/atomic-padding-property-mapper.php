<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Padding_Property_Mapper extends Atomic_Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [ 'padding' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		$dimensions = $this->parse_shorthand_to_logical_properties( (string) $value );
		if ( null === $dimensions ) {
			return null; // FORBIDDEN: No fallbacks for unparseable CSS
		}
		
		return $this->create_atomic_dimensions_value( $property, $dimensions );
	}
}

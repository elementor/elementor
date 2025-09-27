<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Max_Width_Property_Mapper extends Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [ 'max-width' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( empty( $value ) || 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return null;
		}

		if ( 'none' === $value ) {
			return null;
		}

		$parsed = $this->parse_size_value( $value );
		
		if ( empty( $parsed ) || ( isset( $parsed['size'] ) && $parsed['size'] < 0 ) ) {
			return null;
		}

		return Size_Prop_Type::make()->generate( $parsed );
	}
}

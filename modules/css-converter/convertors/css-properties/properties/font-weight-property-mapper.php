<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Weight_Property_Mapper extends Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [ 'font-weight' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( empty( $value ) || 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return null;
		}

		$normalized_value = $this->normalize_font_weight_value( $value );
		
		if ( null === $normalized_value ) {
			return null;
		}

		return String_Prop_Type::make()->generate( $normalized_value );
	}

	private function normalize_font_weight_value( $value ): ?string {
		$value = trim( strtolower( $value ) );

		$valid_values = [
			'100', '200', '300', '400', '500', '600', '700', '800', '900',
			'normal', 'bold', 'bolder', 'lighter'
		];

		if ( in_array( $value, $valid_values, true ) ) {
			return $value;
		}

		$numeric_mappings = [
			'thin' => '100',
			'extra-light' => '200',
			'ultra-light' => '200',
			'light' => '300',
			'regular' => '400',
			'medium' => '500',
			'semi-bold' => '600',
			'demi-bold' => '600',
			'extra-bold' => '800',
			'ultra-bold' => '800',
			'black' => '900',
			'heavy' => '900',
		];

		if ( isset( $numeric_mappings[ $value ] ) ) {
			return $numeric_mappings[ $value ];
		}

		if ( is_numeric( $value ) ) {
			$numeric_value = (int) $value;
			
			if ( $numeric_value >= 100 && $numeric_value <= 900 && $numeric_value % 100 === 0 ) {
				return (string) $numeric_value;
			}
			
			if ( $numeric_value < 100 ) {
				return '100';
			}
			
			if ( $numeric_value > 900 ) {
				return '900';
			}
			
			$rounded = round( $numeric_value / 100 ) * 100;
			return (string) max( 100, min( 900, $rounded ) );
		}

		return null;
	}
}

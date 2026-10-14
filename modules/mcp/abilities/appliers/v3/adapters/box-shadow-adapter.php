<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps a single outer box-shadow onto a V3 Group_Control_Box_Shadow value
 * ({ horizontal, vertical, blur, spread, color } in px). Inset shadows, multiple
 * shadows and non-px units have no V3 equivalent in that control and are rejected.
 */
class Box_Shadow_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'box_shadow';

	const FIELDS = [
		'hOffset' => 'horizontal',
		'vOffset' => 'vertical',
		'blur' => 'blur',
		'spread' => 'spread',
	];

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Box_Shadow_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$shadows = $prop_value['value'] ?? null;

		if ( ! is_array( $shadows ) || 1 !== count( $shadows ) ) {
			return null;
		}

		$shadow = $shadows[0]['value'] ?? null;

		if ( ! is_array( $shadow ) || ! empty( $shadow['position']['value'] ?? null ) ) {
			return null;
		}

		$value = [];

		foreach ( self::FIELDS as $prop_field => $control_field ) {
			$size = Size_Values::from_prop( $shadow[ $prop_field ] ?? null );

			if ( null === $size ) {
				$size = [
					'size' => 0,
					'unit' => 'px',
				];
			}

			if ( 'px' !== $size['unit'] || ! is_numeric( $size['size'] ) ) {
				return null;
			}

			$value[ $control_field ] = $size['size'] + 0;
		}

		$color = $shadow['color']['value'] ?? null;

		if ( ! is_string( $color ) || '' === $color ) {
			return null;
		}

		$value['color'] = $color;

		return $value;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		if ( ! is_array( $control_value ) || ! is_string( $control_value['color'] ?? null ) ) {
			return null;
		}

		$shadow = [];

		foreach ( self::FIELDS as $prop_field => $control_field ) {
			$size = $control_value[ $control_field ] ?? 0;

			if ( ! is_numeric( $size ) ) {
				return null;
			}

			$shadow[ $prop_field ] = Size_Prop_Type::generate( [
				'size' => $size + 0,
				'unit' => 'px',
			] );
		}

		$shadow['color'] = Color_Prop_Type::generate( $control_value['color'] );

		return Box_Shadow_Prop_Type::generate( [ Shadow_Prop_Type::generate( $shadow ) ] );
	}
}

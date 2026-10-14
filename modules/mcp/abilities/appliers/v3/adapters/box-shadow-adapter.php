<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Box_Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Shadow_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shadow_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'box_shadow';

	const LENGTH_FIELDS = [
		'hOffset' => 'horizontal',
		'vOffset' => 'vertical',
		'blur' => 'blur',
		'spread' => 'spread',
	];

	const POSITION_OUTLINE = 'outline';
	const POSITION_INSET = 'inset';
	const PIXEL_UNIT = 'px';

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return Box_Shadow_Prop_Type::get_key() === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$shadows = $prop_value['value'] ?? null;
		$shadow = is_array( $shadows ) ? ( $shadows[0] ?? null ) : null;

		if ( ! is_array( $shadow ) || Shadow_Prop_Type::get_key() !== ( $shadow['$$type'] ?? null ) || ! is_array( $shadow['value'] ?? null ) ) {
			return null;
		}

		$stored = [];

		foreach ( self::LENGTH_FIELDS as $prop_field => $control_field ) {
			$length = $this->pixel_size( $shadow['value'][ $prop_field ] ?? null );

			if ( null === $length ) {
				return null;
			}

			$stored[ $control_field ] = $length;
		}

		$color = $shadow['value']['color']['value'] ?? null;

		if ( ! is_string( $color ) || '' === $color ) {
			return null;
		}

		$position = $shadow['value']['position']['value'] ?? self::POSITION_OUTLINE;

		if ( ! in_array( $position, [ self::POSITION_OUTLINE, self::POSITION_INSET ], true ) ) {
			return null;
		}

		$stored['color'] = $color;
		$stored['position'] = $position;

		return $stored;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		if ( ! is_array( $control_value ) ) {
			return null;
		}

		$shadow = [];

		foreach ( self::LENGTH_FIELDS as $prop_field => $control_field ) {
			$length = $control_value[ $control_field ] ?? null;

			if ( ! is_numeric( $length ) ) {
				return null;
			}

			$shadow[ $prop_field ] = Size_Prop_Type::generate( [
				'size' => $length + 0,
				'unit' => self::PIXEL_UNIT,
			] );
		}

		$color = $control_value['color'] ?? null;

		if ( ! is_string( $color ) || '' === $color ) {
			return null;
		}

		$shadow['color'] = Color_Prop_Type::generate( $color );
		$position = $control_value['position'] ?? self::POSITION_OUTLINE;

		if ( self::POSITION_INSET === $position ) {
			$shadow['position'] = String_Prop_Type::generate( self::POSITION_INSET );
		}

		return Box_Shadow_Prop_Type::generate( [ Shadow_Prop_Type::generate( $shadow ) ] );
	}

	private function pixel_size( $prop_value ) {
		$size = Size_Values::from_prop( $prop_value );

		if ( null === $size || self::PIXEL_UNIT !== $size['unit'] || ! is_numeric( $size['size'] ) ) {
			return null;
		}

		return $size['size'] + 0;
	}
}

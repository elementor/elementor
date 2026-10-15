<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Object_Size_Box_Adapter implements V3_Control_Adapter {

	const CONTROL_TYPE = 'dimensions';

	const BORDER_WIDTH_SIDES = [
		'block-start' => 'top',
		'inline-end' => 'right',
		'block-end' => 'bottom',
		'inline-start' => 'left',
	];

	const BORDER_RADIUS_SIDES = [
		'start-start' => 'top',
		'start-end' => 'right',
		'end-end' => 'bottom',
		'end-start' => 'left',
	];

	private string $prop_type;

	/**
	 * @var array<string, string>
	 */
	private array $logical_to_physical;

	/**
	 * @param string                $prop_type
	 * @param array<string, string> $logical_to_physical
	 */
	public function __construct( string $prop_type, array $logical_to_physical ) {
		$this->prop_type = $prop_type;
		$this->logical_to_physical = $logical_to_physical;
	}

	public function supports( string $prop_type, string $control_type, bool $has_sides ): bool {
		return $this->prop_type === $prop_type && self::CONTROL_TYPE === $control_type && ! $has_sides;
	}

	public function to_control_value( array $prop_value, ?array $sides, array $control ) {
		$sizes = $this->sizes_by_physical_side( $prop_value );

		if ( null === $sizes || ! Size_Values::is_unit_allowed( reset( $sizes ), $control ) ) {
			return null;
		}

		$stored = array_map( fn( array $size ) => (string) $size['size'], $sizes );
		$stored['unit'] = reset( $sizes )['unit'];
		$stored['isLinked'] = Size_Values::are_equal( $sizes );

		return $stored;
	}

	public function from_control_value( $control_value, ?array $sides ): ?array {
		if ( ! is_array( $control_value ) ) {
			return null;
		}

		$value = [];

		foreach ( $this->logical_to_physical as $logical => $physical ) {
			$size = Size_Values::to_prop( [
				'size' => $control_value[ $physical ] ?? null,
				'unit' => $control_value['unit'] ?? null,
			] );

			if ( null === $size ) {
				return null;
			}

			$value[ $logical ] = $size;
		}

		return $this->generate( $value );
	}

	/**
	 * @return array<string, array{unit: string, size: mixed}>|null
	 */
	private function sizes_by_physical_side( array $prop_value ): ?array {
		if ( ( $prop_value['$$type'] ?? null ) !== $this->prop_type || ! is_array( $prop_value['value'] ?? null ) ) {
			return null;
		}

		$sizes = [];

		foreach ( $this->logical_to_physical as $logical => $physical ) {
			$size = Size_Values::from_prop( $prop_value['value'][ $logical ] ?? null );

			if ( null === $size ) {
				return null;
			}

			$sizes[ $physical ] = $size;
		}

		$units = array_unique( array_column( $sizes, 'unit' ) );

		return 1 === count( $units ) ? $sizes : null;
	}

	/**
	 * @param array<string, array<string, mixed>> $value
	 * @return array<string, mixed>
	 */
	private function generate( array $value ): array {
		if ( Border_Width_Prop_Type::get_key() === $this->prop_type ) {
			return Border_Width_Prop_Type::generate( $value );
		}

		return Border_Radius_Prop_Type::generate( $value );
	}
}

<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Slider control used as a content value (e.g. Progress Bar `percent`), stored as `{ unit, size, sizes }`.
 */
class Size_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'slider';

	const DEFAULT_UNIT = 'px';

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null );
	}

	public function prop_type( array $control ): Prop_Type {
		return V3_Size_Prop_Type::make()->units( self::units( $control ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$value = $prop_value['value'] ?? null;

		if ( ! is_array( $value ) || ! isset( $value['unit'] ) ) {
			return null;
		}

		return [
			'unit' => $value['unit'],
			'size' => $value['size'] ?? '',
			'sizes' => [],
		];
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) || ! isset( $stored['unit'] ) || ! is_numeric( $stored['size'] ?? null ) ) {
			return null;
		}

		return [
			'size' => +$stored['size'],
			'unit' => (string) $stored['unit'],
		];
	}

	/**
	 * Sliders without `size_units` accept only the unit of their default (px when none).
	 *
	 * @param array<string, mixed> $control
	 * @return string[]
	 */
	private static function units( array $control ): array {
		if ( ! empty( $control['size_units'] ) && is_array( $control['size_units'] ) ) {
			return array_values( array_map( 'strval', $control['size_units'] ) );
		}

		return [ (string) ( $control['default']['unit'] ?? self::DEFAULT_UNIT ) ];
	}
}

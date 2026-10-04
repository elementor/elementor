<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * `css_properties` for the Advanced-tab controls every V3 widget inherits from `common-base`
 * (layout, position, background, border and box-shadow of the widget wrapper). Maps opt in
 * by adding a target with these properties.
 */
class Advanced_Style_Fragments {

	const HOVER_STATE = 'hover';

	const CUSTOM_WIDTH_VALUE = 'initial';
	const OFFSET_START = 'start';
	const OFFSET_END = 'end';
	const CLASSIC_BACKGROUND = 'classic';

	/**
	 * @return array<string, array<string, array>>
	 */
	public static function wrapper(): array {
		$properties = [
			'margin' => [ 'default' => Style_Control_Target::control( '_margin', 'sides', true ) ],
			'padding' => [ 'default' => Style_Control_Target::control( '_padding', 'sides', true ) ],
			'width' => [ 'default' => self::with_companion( Style_Control_Target::control( '_element_custom_width', 'slider', true ), '_element_width', self::CUSTOM_WIDTH_VALUE ) ],
			'position' => [ 'default' => Style_Control_Target::choice( '_position' ) ],
			'left' => [ 'default' => self::offset( '_offset_x', '_offset_orientation_h', self::OFFSET_START ) ],
			'right' => [ 'default' => self::offset( '_offset_x_end', '_offset_orientation_h', self::OFFSET_END ) ],
			'top' => [ 'default' => self::offset( '_offset_y', '_offset_orientation_v', self::OFFSET_START ) ],
			'bottom' => [ 'default' => self::offset( '_offset_y_end', '_offset_orientation_v', self::OFFSET_END ) ],
			'z-index' => [ 'default' => Style_Control_Target::control( '_z_index', 'number', true ) ],
			'background-color' => [
				'default' => self::with_companion( Style_Control_Target::control( '_background_color', 'color' ), '_background_background', self::CLASSIC_BACKGROUND ),
				self::HOVER_STATE => self::with_companion( Style_Control_Target::control( '_background_hover_color', 'color' ), '_background_hover_background', self::CLASSIC_BACKGROUND ),
			],
			'border-radius' => [
				'default' => Style_Control_Target::control( '_border_radius', 'sides', true ),
				self::HOVER_STATE => Style_Control_Target::control( '_border_radius_hover', 'sides', true ),
			],
			'box-shadow' => [
				'default' => Style_Control_Target::box_shadow( '_box_shadow' ),
				self::HOVER_STATE => Style_Control_Target::box_shadow( '_box_shadow_hover' ),
			],
		];

		$borders = [
			Style_Control_Target::border_group( '_border' ),
			Style_Control_Target::border_group( '_border_hover', self::HOVER_STATE ),
		];

		foreach ( $borders as $border ) {
			foreach ( $border as $property => $states ) {
				$properties[ $property ] = ( $properties[ $property ] ?? [] ) + $states;
			}
		}

		return $properties;
	}

	private static function offset( string $key, string $orientation_key, string $orientation ): array {
		return self::with_companion( Style_Control_Target::control( $key, 'slider', true ), $orientation_key, $orientation );
	}

	/**
	 * Adds a setting that must hold a fixed value for the descriptor's control to take effect.
	 */
	private static function with_companion( array $descriptor, string $key, string $value ): array {
		$descriptor['destinations'][] = [
			'setting' => $key,
			'shape' => V3_Resolved_Patch_Validator::SHAPE_STRING,
			'resolver' => 'text',
		];
		$descriptor['companion_settings'] = ( $descriptor['companion_settings'] ?? [] ) + [ $key => $value ];

		return $descriptor;
	}
}

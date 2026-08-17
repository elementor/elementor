<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives V3 element_config keys from the widget controls stack:
 * all Content (general) and Style tab controls, plus curated Advanced-tab basics.
 */
class V3_Style_Setting_Keys {

	const TAB_CONTENT = 'content';

	const TAB_STYLE = 'style';

	const TAB_ADVANCED = 'advanced';

	const LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];

	const NON_DATA_CONTROL_TYPES = [
		'heading',
		'hidden',
		'raw_html',
		'button',
		'divider',
		'notice',
		'alert',
		'deprecated_notice',
	];

	const ADVANCED_BASIC_PREFIXES = [
		'_padding',
		'_margin',
		'_border_border',
		'_border_width',
		'_border_color',
		'_border_radius',
		'_background_background',
		'_background_color',
		'_background_image',
		'_background_position',
		'_background_size',
		'_background_repeat',
	];

	const RESPONSIVE_SUFFIXES = [ '_tablet', '_mobile' ];

	/**
	 * Keys accepted in element_config: Content + Style + Advanced basics.
	 *
	 * @param array<string, mixed> $controls Widget controls from Widget_Base::get_controls().
	 * @return string[]
	 */
	public static function from_controls( array $controls ): array {
		$keys = array_merge(
			self::content_and_style_keys_from_controls( $controls ),
			self::advanced_basic_keys_from_controls( $controls )
		);

		return array_values( array_unique( $keys ) );
	}

	/**
	 * Keys emitted inline in per-widget JSON Schema (Content + Style only).
	 *
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function content_and_style_keys_from_controls( array $controls ): array {
		$keys = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $control ) ) {
				continue;
			}

			if ( ! self::is_content_or_style_control( $control_key, $control ) ) {
				continue;
			}

			$keys[] = $control_key;
		}

		return array_values( array_unique( $keys ) );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function advanced_basic_keys_from_controls( array $controls ): array {
		$keys = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $control ) ) {
				continue;
			}

			if ( ! self::is_advanced_basic_control( $control_key, $control ) ) {
				continue;
			}

			$keys[] = $control_key;
		}

		return array_values( array_unique( $keys ) );
	}

	/**
	 * @param string               $control_key
	 * @param array<string, mixed> $control
	 */
	public static function is_allowed_setting_key( string $control_key, array $control ): bool {
		return self::is_content_or_style_control( $control_key, $control )
			|| self::is_advanced_basic_control( $control_key, $control );
	}

	/**
	 * @param string               $control_key
	 * @param array<string, mixed> $control
	 */
	public static function is_content_or_style_control( string $control_key, array $control ): bool {
		if ( ! self::is_data_control( $control_key, $control ) ) {
			return false;
		}

		$tab = is_string( $control['tab'] ?? null ) ? $control['tab'] : self::TAB_CONTENT;

		return self::TAB_CONTENT === $tab || self::TAB_STYLE === $tab;
	}

	/**
	 * @param string               $control_key
	 * @param array<string, mixed> $control
	 */
	public static function is_advanced_basic_control( string $control_key, array $control ): bool {
		if ( ! self::is_data_control( $control_key, $control ) ) {
			return false;
		}

		if ( ! self::is_advanced_basic_key( $control_key ) ) {
			return false;
		}

		$tab = $control['tab'] ?? null;

		if ( ! is_string( $tab ) ) {
			return true;
		}

		return self::TAB_ADVANCED === $tab;
	}

	/**
	 * @param string               $control_key
	 * @param array<string, mixed> $control
	 */
	private static function is_data_control( string $control_key, array $control ): bool {
		$control_type = is_string( $control['type'] ?? null ) ? $control['type'] : null;

		if ( $control_type && in_array( $control_type, self::LAYOUT_CONTROL_TYPES, true ) ) {
			return false;
		}

		if ( $control_type && in_array( $control_type, self::NON_DATA_CONTROL_TYPES, true ) ) {
			return false;
		}

		return true;
	}

	private static function is_advanced_basic_key( string $key ): bool {
		foreach ( self::ADVANCED_BASIC_PREFIXES as $prefix ) {
			if ( $key === $prefix ) {
				return true;
			}

			foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
				if ( $key === $prefix . $suffix ) {
					return true;
				}
			}
		}

		return false;
	}
}

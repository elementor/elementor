<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives CSS-property → V3-setting maps from widget controls filtered by inner-element regex.
 */
class V3_Auto_Mapper {

	const STATE_SUFFIXES = [ 'hover', 'active', 'focus' ];

	const RESPONSIVE_SUFFIXES = [ '_tablet', '_mobile' ];

	const TYPOGRAPHY_PROPERTIES = [
		'font-family',
		'font-weight',
		'font-style',
		'text-transform',
		'text-decoration',
		'font-size',
		'line-height',
		'letter-spacing',
		'word-spacing',
	];

	const TYPOGRAPHY_RESPONSIVE_PROPERTIES = [
		'font-size',
		'line-height',
		'letter-spacing',
		'word-spacing',
	];

	/**
	 * @var array<string, array{overrides: array<string, array>, generic_index: array<string, array>}>
	 */
	private static array $cache = [];

	/**
	 * @param array<string, mixed> $widget_config
	 * @param array<string, mixed> $inner_element
	 * @return array{overrides: array<string, array>, generic_index: array<string, array>}
	 */
	public static function for_scope( array $widget_config, array $inner_element ): array {
		$pattern = $inner_element['control_pattern'] ?? '';
		$cache_key = md5( serialize( [ $widget_config['controls'] ?? [], $pattern, $inner_element['style_overrides'] ?? [] ] ) );

		if ( isset( self::$cache[ $cache_key ] ) ) {
			return self::$cache[ $cache_key ];
		}

		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$filtered = self::filter_controls_by_pattern( $controls, (string) $pattern );
		$escape_hatch = is_array( $inner_element['style_overrides'] ?? null ) ? $inner_element['style_overrides'] : [];
		$overrides = array_merge( self::build_group_overrides( $filtered ), $escape_hatch );
		$generic_index = V3_Style_Settings_Index::build( $filtered, $overrides );
		$generic_index = self::merge_name_state_index( $filtered, $generic_index, $overrides );

		$result = [
			'overrides' => $overrides,
			'generic_index' => $generic_index,
		];

		self::$cache[ $cache_key ] = $result;

		return $result;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	public static function filter_controls_by_pattern( array $controls, string $pattern ): array {
		if ( '' === $pattern ) {
			return [];
		}

		$filtered = [];

		foreach ( $controls as $key => $control ) {
			if ( ! is_string( $key ) || ! is_array( $control ) ) {
				continue;
			}

			if ( 1 === preg_match( $pattern, $key ) ) {
				$filtered[ $key ] = $control;
			}
		}

		return $filtered;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function collect_setting_keys_for_pattern( array $controls, string $pattern ): array {
		return array_keys( self::filter_controls_by_pattern( $controls, $pattern ) );
	}

	/**
	 * @param array<string, mixed> $widget_config
	 * @param array<string, mixed> $inner_element
	 * @return string[]
	 */
	public static function accepted_css_properties( array $widget_config, array $inner_element ): array {
		$mapping = self::for_scope( $widget_config, $inner_element );
		$keys = array_merge(
			array_keys( $mapping['overrides'] ),
			array_keys( $mapping['generic_index'] )
		);

		$properties = [];

		foreach ( $keys as $key ) {
			$property = explode( '@', $key, 2 )[0];
			$properties[ $property ] = true;
		}

		return array_keys( $properties );
	}

	/**
	 * @param array<string, mixed> $widget_config
	 * @param array<string, mixed> $inner_element
	 * @return string[]
	 */
	public static function supported_states( array $widget_config, array $inner_element ): array {
		$mapping = self::for_scope( $widget_config, $inner_element );
		$keys = array_merge(
			array_keys( $mapping['overrides'] ),
			array_keys( $mapping['generic_index'] )
		);

		$states = [];

		foreach ( $keys as $key ) {
			if ( ! str_contains( $key, '@' ) ) {
				continue;
			}

			$state = explode( '@', $key, 2 )[1];
			$states[ $state ] = true;
		}

		return array_keys( $states );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, array>
	 */
	private static function build_group_overrides( array $controls ): array {
		$overrides = [];

		foreach ( self::detect_typography_prefixes( $controls ) as $prefix ) {
			$overrides = array_merge( $overrides, self::typography_overrides_for_prefix( $prefix ) );
		}

		foreach ( self::detect_border_prefixes( $controls ) as $prefix ) {
			$overrides['border'] = [ 'border_prefix' => $prefix ];
		}

		foreach ( self::detect_box_shadow_prefixes( $controls ) as $prefix ) {
			$overrides['box-shadow'] = [ 'box_shadow_prefix' => $prefix ];
		}

		return $overrides;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	private static function detect_typography_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(.+)_typography_(?:typography|font_|line_|letter_|word_|text_)/', $key, $matches ) ) {
				$prefixes[ $matches[1] . '_typography' ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	private static function detect_border_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(.+)_border_(?:border|width|color)$/', $key, $matches ) ) {
				$prefixes[ $matches[1] . '_border' ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	private static function detect_box_shadow_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(.+)_box_shadow(?:_type)?$/', $key, $matches ) ) {
				$prefixes[ $matches[1] . '_box_shadow' ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * @return array<string, array>
	 */
	private static function typography_overrides_for_prefix( string $prefix ): array {
		$overrides = [];

		foreach ( self::TYPOGRAPHY_PROPERTIES as $property ) {
			$overrides[ $property ] = [
				'typography_prefix' => $prefix,
				'responsive' => in_array( $property, self::TYPOGRAPHY_RESPONSIVE_PROPERTIES, true ),
			];
		}

		return $overrides;
	}

	/**
	 * @param array<string, mixed>        $controls
	 * @param array<string, array>        $generic_index
	 * @param array<string, array>        $overrides
	 * @return array<string, array>
	 */
	private static function merge_name_state_index( array $controls, array $generic_index, array $overrides ): array {
		foreach ( $controls as $setting_key => $control ) {
			if ( ! is_string( $setting_key ) || ! is_array( $control ) ) {
				continue;
			}

			$selectors = $control['selectors'] ?? null;
			if ( ! is_array( $selectors ) || empty( $selectors ) ) {
				continue;
			}

			$state = self::state_from_setting_key( $setting_key );

			foreach ( $selectors as $selector_template => $css_template ) {
				if ( ! is_string( $css_template ) ) {
					continue;
				}

				if ( null === $state && is_string( $selector_template ) ) {
					$state = self::state_from_selector( $selector_template );
				}

				foreach ( self::extract_css_properties( $css_template ) as $property ) {
					$match_key = null === $state ? $property : $property . '@' . $state;

					if ( isset( $overrides[ $match_key ] ) || isset( $generic_index[ $match_key ] ) ) {
						continue;
					}

					$generic_index[ $match_key ] = [
						'setting' => $setting_key,
						'resolver' => self::infer_resolver( $control, $property ),
						'responsive' => self::is_responsive_control( $setting_key, $controls ),
					];
				}
			}
		}

		return $generic_index;
	}

	private static function state_from_setting_key( string $setting_key ): ?string {
		$base = $setting_key;

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
			if ( str_ends_with( $base, $suffix ) ) {
				$base = substr( $base, 0, -strlen( $suffix ) );
			}
		}

		foreach ( self::STATE_SUFFIXES as $state ) {
			$suffix = '_' . $state;
			if ( str_ends_with( $base, $suffix ) ) {
				return $state;
			}
		}

		return null;
	}

	private static function state_from_selector( string $selector_template ): ?string {
		if ( preg_match( '/:(hover|focus|active)\b/i', $selector_template, $matches ) ) {
			return strtolower( $matches[1] );
		}

		return null;
	}

	/**
	 * @return string[]
	 */
	private static function extract_css_properties( string $css_template ): array {
		$properties = [];

		foreach ( explode( ';', $css_template ) as $declaration ) {
			$declaration = trim( $declaration );
			if ( '' === $declaration || ! str_contains( $declaration, ':' ) ) {
				continue;
			}

			$property = strtolower( trim( strstr( $declaration, ':', true ) ?: '' ) );
			if ( '' !== $property ) {
				$properties[ $property ] = true;
			}
		}

		return array_keys( $properties );
	}

	/**
	 * @param array<string, mixed> $controls
	 */
	private static function is_responsive_control( string $setting_key, array $controls ): bool {
		return isset( $controls[ $setting_key . '_tablet' ] ) || isset( $controls[ $setting_key . '_mobile' ] );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function infer_resolver( array $control, string $property ): string {
		$type = $control['type'] ?? null;

		if ( 'color' === $type || str_ends_with( $property, 'color' ) || 'fill' === $property ) {
			return 'color';
		}

		if ( in_array( $property, [ 'padding', 'margin', 'border-radius' ], true ) ) {
			return 'sides';
		}

		if ( in_array( $type, [ 'slider', 'dimensions' ], true ) ) {
			return 'dimensions' === $type ? 'sides' : 'dimension';
		}

		if ( in_array( $property, [ 'width', 'height', 'max-width', 'min-height', 'font-size', 'line-height', 'letter-spacing', 'word-spacing', 'opacity', 'top', 'right', 'bottom', 'left' ], true ) ) {
			return 'dimension';
		}

		if ( 'box-shadow' === $property ) {
			return 'box_shadow';
		}

		if ( 'border' === $property ) {
			return 'border';
		}

		return 'text';
	}
}

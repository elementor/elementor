<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives CSS-property → V3-setting maps for one scope (widget wrapper or inner element).
 *
 * Scope membership is an explicit list of setting keys, resolved by V3_Widget_Map_Loader
 * from a checked-in map file or from V3_Control_Introspector.
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

	const BORDER_LONGHANDS = [
		'border-style' => [
			'setting' => 'border',
			'resolver' => 'text',
			'responsive' => false,
		],
		'border-width' => [
			'setting' => 'width',
			'resolver' => 'sides',
			'responsive' => true,
		],
		'border-color' => [
			'setting' => 'color',
			'resolver' => 'color',
			'responsive' => false,
		],
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
	 * Mapping over every control of the widget, for callers that address the widget as a whole
	 * (serializing settings back to CSS, collecting owned setting keys) rather than per scope.
	 *
	 * @param array<string, mixed> $widget_config
	 * @return array{overrides: array<string, array>, generic_index: array<string, array>}
	 */
	public static function for_widget( array $widget_config, string $widget_type ): array {
		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];

		return self::for_scope(
			$widget_config,
			[
				'setting_keys' => array_keys( $controls ),
				'style_overrides' => V3_Widget_Map_Loader::get_wrapper_style_overrides( $widget_type, $controls ),
			]
		);
	}

	/**
	 * @param array<string, mixed> $widget_config
	 * @param array<string, mixed> $scope Scope descriptor: setting_keys + optional style_overrides.
	 * @return array{overrides: array<string, array>, generic_index: array<string, array>}
	 */
	public static function for_scope( array $widget_config, array $scope ): array {
		$setting_keys = is_array( $scope['setting_keys'] ?? null ) ? $scope['setting_keys'] : [];
		// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode -- Cache key only, never output.
		$cache_key = md5( (string) json_encode( [ $widget_config['controls'] ?? [], $setting_keys, $scope['style_overrides'] ?? [] ] ) );

		if ( isset( self::$cache[ $cache_key ] ) ) {
			return self::$cache[ $cache_key ];
		}

		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$filtered = self::filter_controls_by_keys( $controls, $setting_keys );
		$escape_hatch = is_array( $scope['style_overrides'] ?? null ) ? $scope['style_overrides'] : [];
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
	 * @param string[]             $setting_keys
	 * @return array<string, mixed>
	 */
	public static function filter_controls_by_keys( array $controls, array $setting_keys ): array {
		return array_filter(
			array_intersect_key( $controls, array_fill_keys( $setting_keys, true ) ),
			'is_array'
		);
	}

	/**
	 * @param array<string, mixed> $widget_config
	 * @param array<string, mixed> $scope
	 * @return string[]
	 */
	public static function accepted_css_properties( array $widget_config, array $scope ): array {
		$mapping = self::for_scope( $widget_config, $scope );
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
	 * @param array<string, mixed> $scope
	 * @return string[]
	 */
	public static function supported_states( array $widget_config, array $scope ): array {
		$mapping = self::for_scope( $widget_config, $scope );
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

		foreach ( V3_Group_Control_Detector::typography_prefixes( $controls ) as $prefix ) {
			$overrides = array_merge( $overrides, self::typography_overrides_for_prefix( $prefix ) );
		}

		foreach ( self::sort_widget_own_prefixes_last( V3_Group_Control_Detector::border_prefixes( $controls ) ) as $prefix ) {
			$overrides[ self::match_key( 'border', $prefix ) ] = [ 'border_prefix' => $prefix ];
			$overrides = array_merge( $overrides, self::border_longhand_overrides( $prefix ) );
		}

		foreach ( self::sort_widget_own_prefixes_last( V3_Group_Control_Detector::box_shadow_prefixes( $controls ) ) as $prefix ) {
			$overrides[ self::match_key( 'box-shadow', $prefix ) ] = [ 'box_shadow_prefix' => $prefix ];
		}

		return $overrides;
	}

	/**
	 * Advanced-tab group controls are prefixed with an underscore and exist on every widget, so
	 * when both they and a widget-own group produce the same property, the widget-own one wins.
	 *
	 * @param string[] $prefixes
	 * @return string[]
	 */
	private static function sort_widget_own_prefixes_last( array $prefixes ): array {
		usort(
			$prefixes,
			static fn( $first, $second ) => (int) str_starts_with( $second, '_' ) <=> (int) str_starts_with( $first, '_' )
		);

		return $prefixes;
	}

	/**
	 * A border group writes style, width and color into separate settings, so the longhands are
	 * routed explicitly instead of competing with unrelated bordered sub-parts in the index.
	 *
	 * @return array<string, array>
	 */
	private static function border_longhand_overrides( string $prefix ): array {
		$overrides = [];

		foreach ( self::BORDER_LONGHANDS as $property => $suffix ) {
			$overrides[ self::match_key( $property, $prefix ) ] = [
				'setting' => $prefix . '_' . $suffix['setting'],
				'resolver' => $suffix['resolver'],
				'responsive' => $suffix['responsive'],
			];
		}

		return $overrides;
	}

	/**
	 * A widget declares one group control per state (`_box_shadow` and `_box_shadow_hover`), so
	 * the state is read back from the prefix to keep both reachable.
	 */
	private static function match_key( string $property, string $setting_prefix ): string {
		$state = self::state_from_setting_key( $setting_prefix );

		return null === $state ? $property : $property . '@' . $state;
	}

	/**
	 * @return array<string, array>
	 */
	private static function typography_overrides_for_prefix( string $prefix ): array {
		$overrides = [];

		foreach ( self::TYPOGRAPHY_PROPERTIES as $property ) {
			$overrides[ self::match_key( $property, $prefix ) ] = [
				'typography_prefix' => $prefix,
				'responsive' => in_array( $property, self::TYPOGRAPHY_RESPONSIVE_PROPERTIES, true ),
			];
		}

		return $overrides;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @param array<string, array> $generic_index
	 * @param array<string, array> $overrides
	 * @return array<string, array>
	 */
	private static function merge_name_state_index( array $controls, array $generic_index, array $overrides ): array {
		foreach ( self::widget_own_controls_first( $controls ) as $setting_key => $control ) {
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
					if ( V3_Style_Settings_Index::is_internal_property( $property ) ) {
						continue;
					}

					$match_key = null === $state ? $property : $property . '@' . $state;

					if ( isset( $overrides[ $match_key ] ) || isset( $generic_index[ $match_key ] ) ) {
						continue;
					}

					$generic_index[ $match_key ] = [
						'setting' => $setting_key,
						'resolver' => V3_Control_Value_Compatibility::infer_resolver( $control, $property ),
						'responsive' => self::is_responsive_control( $setting_key, $controls ),
					];
				}
			}
		}

		return $generic_index;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	private static function widget_own_controls_first( array $controls ): array {
		$own = [];
		$advanced = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( is_string( $setting_key ) && str_starts_with( $setting_key, '_' ) ) {
				$advanced[ $setting_key ] = $control;
				continue;
			}

			$own[ $setting_key ] = $control;
		}

		return $own + $advanced;
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

			$prefix = strstr( $declaration, ':', true );
			$property = strtolower( trim( false === $prefix ? '' : $prefix ) );
			if ( '' !== $property ) {
				$properties[ $property ] = true;
			}
		}

		return array_keys( $properties );
	}

	/**
	 * @param string               $setting_key
	 * @param array<string, mixed> $controls
	 */
	private static function is_responsive_control( string $setting_key, array $controls ): bool {
		return V3_Control_Introspector::is_responsive_setting( $setting_key, $controls );
	}

}

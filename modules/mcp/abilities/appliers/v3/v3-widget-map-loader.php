<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves the MCP mapping for a V3 widget from two layers:
 *
 * 1. `V3_Control_Introspector` — derives everything obtainable from the widget's own controls.
 * 2. `maps/<widget-type>-map.php` — the curated deltas that need human judgement, winning over
 *    the derivation. This is the migration target: the same array a widget class will
 *    eventually return itself.
 *
 * Inner-element aliases are opt-in: only a map file can declare them, so adding a widget
 * to the allowlist never silently changes the CSS contract the LLM is given.
 */
class V3_Widget_Map_Loader {

	const MAPS_DIR = __DIR__ . '/maps';

	/**
	 * Every V3 widget carries the same Advanced-tab spacing controls, and both are `dimensions`
	 * controls: the generic index can only reach them through the shorthand, so the per-side
	 * properties an LLM naturally writes (`margin-top`) are wired up here for all widgets.
	 */
	const SPACING_SETTINGS = [
		'margin' => '_margin',
		'padding' => '_padding',
	];

	const SIDES = [ 'top', 'right', 'bottom', 'left' ];

	/**
	 * @var array<string, array<string, mixed>|null>
	 */
	private static array $cache = [];

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls Widget controls, for the runtime fallback.
	 * @return array{
	 *     widget_type: string,
	 *     default_inner_element: ?string,
	 *     description: ?string,
	 *     wrapper: array{setting_keys: string[], style_overrides: array<string, array>, excluded_advanced_keys: string[]},
	 *     inner_elements: array<string, array<string, mixed>>,
	 *     non_style_keys: string[]
	 * }
	 */
	public static function get( string $widget_type, array $controls = [] ): array {
		return self::resolve( $widget_type, $controls );
	}

	/**
	 * Guidance an LLM cannot infer from controls, such as preferring a V4 widget instead.
	 */
	public static function get_description( string $widget_type ): ?string {
		return self::non_empty_string( ( self::read_map_file( $widget_type ) ?? [] )['description'] ?? null );
	}

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls
	 * @return array<string, array<string, mixed>>
	 */
	public static function get_inner_elements( string $widget_type, array $controls = [] ): array {
		return self::get( $widget_type, $controls )['inner_elements'];
	}

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls
	 */
	public static function get_default_inner_element( string $widget_type, array $controls = [] ): ?string {
		return self::get( $widget_type, $controls )['default_inner_element'];
	}

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function get_non_style_keys( string $widget_type, array $controls = [] ): array {
		return self::get( $widget_type, $controls )['non_style_keys'];
	}

	/**
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls
	 * @return array<string, array>
	 */
	public static function get_wrapper_style_overrides( string $widget_type, array $controls = [] ): array {
		return self::get( $widget_type, $controls )['wrapper']['style_overrides'];
	}

	public static function has_map_file( string $widget_type ): bool {
		return null !== self::read_map_file( $widget_type );
	}

	/**
	 * Maps padding / margin shorthand and longhands to a dimensions control that writes CSS variables on {{WRAPPER}}.
	 *
	 * @return array<string, array>
	 */
	public static function spacing_overrides_for( string $setting, bool $responsive = true ): array {
		$overrides = [
			'padding' => [
				'setting' => $setting,
				'resolver' => 'sides',
				'responsive' => $responsive,
			],
		];

		foreach ( self::SIDES as $side ) {
			$overrides[ 'padding-' . $side ] = [
				'setting' => $setting,
				'resolver' => 'dimension_side',
				'side' => $side,
				'responsive' => $responsive,
			];
		}

		return $overrides;
	}

	/**
	 * @return array<string, array>
	 */
	public static function border_radius_overrides_for( string $setting, bool $responsive = true ): array {
		return [
			'border-radius' => [
				'setting' => $setting,
				'resolver' => 'sides',
				'responsive' => $responsive,
			],
		];
	}

	/**
	 * @return array<string, array>
	 */
	public static function color_overrides_for( array $state_settings, bool $responsive = false ): array {
		$overrides = [];

		foreach ( $state_settings as $state => $setting ) {
			$key = '' === $state ? 'color' : 'color@' . $state;
			$overrides[ $key ] = [
				'setting' => $setting,
				'resolver' => 'color',
				'responsive' => $responsive,
			];
		}

		return $overrides;
	}

	/**
	 * @return array<string, array>
	 */
	public static function dimension_override( string $property, string $setting, bool $responsive = true ): array {
		return [
			$property => [
				'setting' => $setting,
				'resolver' => 'dimension',
				'responsive' => $responsive,
			],
		];
	}

	/**
	 * @return array<string, mixed>|null
	 */
	private static function read_map_file( string $widget_type ): ?array {
		if ( array_key_exists( $widget_type, self::$cache ) ) {
			return self::$cache[ $widget_type ];
		}

		$path = self::MAPS_DIR . '/' . $widget_type . '-map.php';
		$map = is_readable( $path ) ? require $path : null;

		self::$cache[ $widget_type ] = is_array( $map ) ? $map : null;

		return self::$cache[ $widget_type ];
	}

	/**
	 * Everything a map file does not state is derived from the controls, so map files stay
	 * small and only carry the parts that need human judgement: which sections are worth
	 * exposing as aliases, their names, and value-resolution deltas.
	 *
	 * @param string               $widget_type
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	private static function resolve( string $widget_type, array $controls ): array {
		$derived = V3_Control_Introspector::derive( $controls );
		$map = self::read_map_file( $widget_type ) ?? [];
		$wrapper = is_array( $map['wrapper'] ?? null ) ? $map['wrapper'] : [];
		$inner_elements = self::resolve_inner_elements( $map['inner_elements'] ?? null, $controls );

		return [
			'widget_type' => $widget_type,
			'default_inner_element' => self::non_empty_string( $map['default_inner_element'] ?? null ),
			'description' => self::non_empty_string( $map['description'] ?? null ),
			'wrapper' => [
				'setting_keys' => empty( $inner_elements )
					? V3_Control_Introspector::styleable_setting_keys( $controls )
					: $derived['wrapper']['setting_keys'],
				'style_overrides' => array_merge(
					self::spacing_overrides(),
					self::element_width_overrides(),
					self::array_map_value( $wrapper['style_overrides'] ?? null )
				),
				'excluded_advanced_keys' => $derived['excluded_advanced_keys'],
			],
			'inner_elements' => $inner_elements,
			'non_style_keys' => $derived['non_style_keys'],
		];
	}

	private static function spacing_overrides(): array {
		$overrides = [];

		foreach ( self::SPACING_SETTINGS as $property => $setting ) {
			$overrides[ $property ] = [
				'setting' => $setting,
				'resolver' => 'sides',
				'responsive' => true,
			];

			foreach ( self::SIDES as $side ) {
				$overrides[ $property . '-' . $side ] = [
					'setting' => $setting,
					'resolver' => 'dimension_side',
					'side' => $side,
					'responsive' => true,
				];
			}
		}

		return $overrides;
	}

	/**
	 * @return array<string, array>
	 */
	private static function element_width_overrides(): array {
		return [
			'width' => [
				'resolver' => 'element_width',
				'responsive' => true,
			],
			'max-width' => [
				'resolver' => 'element_width',
				'responsive' => true,
			],
		];
	}

	/**
	 * @param mixed                $declared Inner elements declared by the map file.
	 * @param array<string, mixed> $controls
	 * @return array<string, array<string, mixed>>
	 */
	private static function resolve_inner_elements( $declared, array $controls ): array {
		if ( ! is_array( $declared ) ) {
			return [];
		}

		$inner_elements = [];

		foreach ( $declared as $alias => $inner_element ) {
			if ( ! is_string( $alias ) || ! is_array( $inner_element ) ) {
				continue;
			}

			$section_id = self::non_empty_string( $inner_element['section_id'] ?? null );

			$inner_elements[ $alias ] = null === $section_id
				? $inner_element
				: array_merge( V3_Control_Introspector::scope_for_section( $controls, $section_id ), $inner_element );
		}

		return $inner_elements;
	}

	/**
	 * @param mixed $value
	 */
	private static function non_empty_string( $value ): ?string {
		return is_string( $value ) && '' !== $value ? $value : null;
	}

	/**
	 * @param mixed $value
	 * @return array<string, mixed>
	 */
	private static function array_map_value( $value ): array {
		return is_array( $value ) ? $value : [];
	}
}

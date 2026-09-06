<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Bakes an instance's overrides into a component element tree so it can be exported without
 * the component post. PHP port of `resolveDetachedInstance` and `resolveOverridableSettings`
 * from `packages/packages/core/editor-components/src/utils/detach-component-instance/`.
 *
 * Pure array in / array out; no DB access, no prop-type instantiation. Element and local
 * style id regeneration are intentionally not ported here; callers rely on the export
 * pipeline (`Db::iterate_data()` and the `elementor/document/element/replace_id` filter)
 * to produce fresh ids downstream.
 */
class Resolve_Detached_Instance {
	const OVERRIDE_TYPE = 'override';
	const OVERRIDABLE_TYPE = Overridable_Prop_Type::META_KEY;

	public static function apply( array $element, array $overrides ): array {
		$override_map = self::build_override_map( $overrides );

		return self::resolve_element( $element, $override_map );
	}

	private static function resolve_element( array $element, array $override_map ): array {
		if ( isset( $element['settings'] ) && is_array( $element['settings'] ) ) {
			$element['settings'] = self::resolve_settings( $element, $override_map );
		}

		if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
			$element['elements'] = array_map(
				fn( $child ) => is_array( $child ) ? self::resolve_element( $child, $override_map ) : $child,
				$element['elements']
			);
		}

		return $element;
	}

	private static function resolve_settings( array $element, array $override_map ): array {
		if ( Component_Instance_Prop_Type::is_instance_element( $element ) ) {
			return self::resolve_nested_instance_settings( $element['settings'], $override_map );
		}

		$resolved = [];

		foreach ( $element['settings'] as $key => $value ) {
			$resolved[ $key ] = self::resolve_prop_value( $value, $override_map );
		}

		return $resolved;
	}

	private static function resolve_nested_instance_settings( array $settings, array $override_map ): array {
		$overrides = $settings['component_instance']['value']['overrides']['value'] ?? null;

		if ( ! is_array( $overrides ) || empty( $overrides ) ) {
			return $settings;
		}

		$updated_overrides = array_map(
			fn( $item ) => self::resolve_prop_value( $item, $override_map, true ),
			$overrides
		);

		$updated_overrides = array_values( array_filter( $updated_overrides, fn( $item ) => null !== $item ) );

		$settings['component_instance']['value']['overrides']['value'] = $updated_overrides;

		return $settings;
	}

	/**
	 * Mirrors `resolvePropValue` in the JS. Recurses through nested prop values so any
	 * `$$type: 'overridable'` wrapper anywhere inside the settings tree is unwrapped —
	 * the overridable schema extender wraps every prop, including ones nested inside
	 * object shapes and array item types.
	 */
	private static function resolve_prop_value( $value, array $override_map, bool $is_overridable_override = false ) {
		if ( ! self::is_prop_value( $value ) ) {
			return self::recurse_into_container( $value, $override_map );
		}

		if ( self::OVERRIDABLE_TYPE !== ( $value['$$type'] ?? null ) ) {
			$inner = $value['value'] ?? null;
			$value['value'] = self::recurse_into_container( $inner, $override_map );

			return $value;
		}

		$override_key = $value['value']['override_key'] ?? null;
		$origin_value = Overridable_Prop_Type::normalize_origin_value( $value['value']['origin_value'] ?? null );
		$matching_override = is_string( $override_key ) ? ( $override_map[ $override_key ] ?? null ) : null;

		if ( null === $matching_override ) {
			return $origin_value;
		}

		if ( $is_overridable_override ) {
			return self::resolve_overridable_override( $matching_override, $origin_value );
		}

		$matching_override_value = $matching_override['value']['override_value'] ?? null;

		return null !== $matching_override_value ? $matching_override_value : $origin_value;
	}

	private static function recurse_into_container( $value, array $override_map ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		$result = [];

		foreach ( $value as $key => $inner ) {
			$result[ $key ] = self::resolve_prop_value( $inner, $override_map );
		}

		return $result;
	}

	private static function resolve_overridable_override( array $matching_override, $origin_value ) {
		if ( ! self::is_prop_value( $origin_value ) || self::OVERRIDE_TYPE !== ( $origin_value['$$type'] ?? null ) ) {
			return null;
		}

		return [
			'$$type' => self::OVERRIDE_TYPE,
			'value' => [
				'override_key' => $origin_value['value']['override_key'] ?? null,
				'override_value' => $matching_override['value']['override_value'] ?? null,
				'schema_source' => $origin_value['value']['schema_source'] ?? null,
			],
		];
	}

	private static function build_override_map( array $overrides ): array {
		$map = [];

		foreach ( $overrides as $item ) {
			$override = self::extract_override( $item );

			if ( null === $override ) {
				continue;
			}

			$override_key = $override['value']['override_key'] ?? null;

			if ( is_string( $override_key ) ) {
				$map[ $override_key ] = $override;
			}
		}

		return $map;
	}

	private static function extract_override( $item ): ?array {
		if ( ! self::is_prop_value( $item ) ) {
			return null;
		}

		if ( self::OVERRIDE_TYPE === $item['$$type'] ) {
			return $item;
		}

		if ( self::OVERRIDABLE_TYPE === $item['$$type'] ) {
			$origin_value = $item['value']['origin_value'] ?? null;

			if ( self::is_prop_value( $origin_value ) && self::OVERRIDE_TYPE === $origin_value['$$type'] ) {
				return $origin_value;
			}
		}

		return null;
	}

	private static function is_prop_value( $value ): bool {
		return is_array( $value ) && isset( $value['$$type'] ) && array_key_exists( 'value', $value );
	}
}

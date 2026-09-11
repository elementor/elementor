<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;
use Elementor\Modules\Mcp\Abilities\Prop_Canonicalizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * LLM contract for per-breakpoint settings: reserved `settings_variants` key,
 * plain values, `{ breakpoint, props }` rows (desktop stays in `settings`).
 */
class Settings_Variants_Llm {
	const KEY = 'settings_variants';

	/**
	 * @return array{present: bool, value: mixed}
	 */
	public static function peel( array &$settings ): array {
		if ( ! array_key_exists( self::KEY, $settings ) ) {
			return [
				'present' => false,
				'value' => null,
			];
		}

		$value = $settings[ self::KEY ];
		unset( $settings[ self::KEY ] );

		return [
			'present' => true,
			'value' => $value,
		];
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 * @param array<int, array{meta?: array, props?: array}> $raw_variants
	 * @return list<array{breakpoint: string, props: array}>
	 */
	public static function serialize( array $schema, array $raw_variants ): array {
		$serialized = [];

		foreach ( $raw_variants as $variant ) {
			if ( ! is_array( $variant ) ) {
				continue;
			}

			$breakpoint = $variant['meta']['breakpoint'] ?? $variant['breakpoint'] ?? null;
			$props = $variant['props'] ?? [];

			if ( ! is_string( $breakpoint ) || ! is_array( $props ) || empty( $props ) ) {
				continue;
			}

			$plain_props = self::serialize_props( $schema, $props );

			if ( empty( $plain_props ) ) {
				continue;
			}

			$serialized[] = [
				'breakpoint' => $breakpoint,
				'props' => $plain_props,
			];
		}

		return $serialized;
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 */
	public static function apply(
		array &$node,
		$incoming,
		array $schema,
		string $element_type,
		string $config_id,
		Plain_Values_Resolver $plain_values_resolver,
		array &$errors,
		array &$warnings
	): void {
		if ( ! is_array( $incoming ) ) {
			$errors[] = sprintf( '[%s] settings_variants must be an array.', $config_id );
			return;
		}

		if ( [] === $incoming ) {
			$node[ self::KEY ] = [];
			return;
		}

		$indexed = self::index_existing( $node[ self::KEY ] ?? [] );
		$responsive_schema = Responsive_Settings::filter_schema( $schema );
		$alias_map = Prop_Canonicalizer::build_alias_map( $responsive_schema );

		foreach ( $incoming as $index => $row ) {
			if ( ! is_array( $row ) ) {
				$errors[] = sprintf( '[%s] settings_variants[%s] must be an object.', $config_id, $index );
				continue;
			}

			$breakpoint = $row['breakpoint'] ?? $row['meta']['breakpoint'] ?? null;
			$props = $row['props'] ?? null;

			if ( ! is_string( $breakpoint ) || '' === $breakpoint ) {
				$errors[] = sprintf( '[%s] settings_variants[%s].breakpoint is required.', $config_id, $index );
				continue;
			}

			if ( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP === $breakpoint ) {
				$errors[] = sprintf(
					'[%s] settings_variants[%s] used breakpoint "desktop". Put desktop values in settings, not settings_variants.',
					$config_id,
					$index
				);
				continue;
			}

			if ( ! Responsive_Settings::is_valid_breakpoint( $breakpoint ) ) {
				$errors[] = sprintf(
					'[%s] settings_variants[%s] has unknown breakpoint "%s".',
					$config_id,
					$index,
					$breakpoint
				);
				continue;
			}

			if ( ! is_array( $props ) ) {
				$errors[] = sprintf( '[%s] settings_variants[%s].props must be an object.', $config_id, $index );
				continue;
			}

			$existing_props = $indexed[ $breakpoint ]['props'] ?? [];
			$merged_props = self::merge_variant_props(
				$existing_props,
				$props,
				$responsive_schema,
				$alias_map,
				$element_type,
				$config_id,
				$index,
				$plain_values_resolver,
				$errors,
				$warnings
			);

			if ( empty( $merged_props ) ) {
				unset( $indexed[ $breakpoint ] );
				continue;
			}

			$indexed[ $breakpoint ] = [
				'meta' => [ 'breakpoint' => $breakpoint ],
				'props' => $merged_props,
			];
		}

		$node[ self::KEY ] = array_values( $indexed );
	}

	/**
	 * JSON Schema fragment for get-widget-schema when the widget has responsive props.
	 *
	 * @param array<string, array> $responsive_property_schemas Plain LLM schemas keyed by prop name.
	 */
	public static function schema_property( array $responsive_property_schemas ): array {
		$breakpoints = array_values(
			array_filter(
				Responsive_Settings::breakpoint_keys(),
				static fn( string $key ) => Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP !== $key
			)
		);

		return [
			'type' => 'array',
			'description' => 'Per-breakpoint overrides for properties marked x-responsive. Desktop values stay in the top-level settings keys. Each row: { breakpoint, props }. Send [] to clear all overrides. Set a prop to null to remove that override. This is not the legacy v3 _tablet / _mobile suffix pattern.',
			'items' => [
				'type' => 'object',
				'required' => [ 'breakpoint', 'props' ],
				'additionalProperties' => false,
				'properties' => [
					'breakpoint' => [
						'type' => 'string',
						'enum' => $breakpoints,
					],
					'props' => [
						'type' => 'object',
						'additionalProperties' => false,
						'properties' => $responsive_property_schemas,
					],
				],
			],
		];
	}

	/**
	 * @param array<string, Prop_Type> $schema
	 */
	private static function serialize_props( array $schema, array $raw_props ): array {
		$intersected = array_intersect_key( $schema, $raw_props );
		$serialized = [];
		$static_schema = [];

		foreach ( $intersected as $key => $prop_type ) {
			$dynamic = Dynamic_Tag_Llm_Resolver::try_serialize( $raw_props[ $key ] );

			if ( null !== $dynamic ) {
				$serialized[ $key ] = $dynamic;
				continue;
			}

			$static_schema[ $key ] = $prop_type;
		}

		if ( ! empty( $static_schema ) ) {
			$serialized += Render_Props_Resolver::for_settings()->resolve( $static_schema, $raw_props );
		}

		return $serialized;
	}

	/**
	 * @param array<int, array> $variants
	 * @return array<string, array{meta: array{breakpoint: string}, props: array}>
	 */
	private static function index_existing( $variants ): array {
		$indexed = [];

		if ( ! is_array( $variants ) ) {
			return $indexed;
		}

		foreach ( $variants as $variant ) {
			if ( ! is_array( $variant ) ) {
				continue;
			}

			$breakpoint = $variant['meta']['breakpoint'] ?? null;
			$props = $variant['props'] ?? [];

			if ( ! is_string( $breakpoint ) || ! is_array( $props ) ) {
				continue;
			}

			$indexed[ $breakpoint ] = [
				'meta' => [ 'breakpoint' => $breakpoint ],
				'props' => $props,
			];
		}

		return $indexed;
	}

	/**
	 * @param array<string, Prop_Type> $responsive_schema
	 */
	private static function merge_variant_props(
		array $existing_props,
		array $incoming_props,
		array $responsive_schema,
		array $alias_map,
		string $element_type,
		string $config_id,
		$index,
		Plain_Values_Resolver $plain_values_resolver,
		array &$errors,
		array &$warnings
	): array {
		$merged = $existing_props;

		foreach ( $incoming_props as $name => $value ) {
			$canonical = Prop_Canonicalizer::resolve_canonical_key( $responsive_schema, (string) $name, $alias_map );

			if ( null === $canonical ) {
				$warnings[] = sprintf(
					'[%s] settings_variants[%s] property "%s" is not a responsive setting on "%s" and was skipped.',
					$config_id,
					$index,
					$name,
					$element_type
				);
				continue;
			}

			if ( null === $value ) {
				unset( $merged[ $canonical ] );
				continue;
			}

			$prop_type = $responsive_schema[ $canonical ] ?? null;

			if ( ! $prop_type instanceof Prop_Type ) {
				continue;
			}

			$resolved_value = $plain_values_resolver->resolve( $value, $prop_type );

			if ( null === $resolved_value ) {
				$errors[] = sprintf(
					'[%s] settings_variants[%s] property "%s" on "%s" could not be resolved.',
					$config_id,
					$index,
					$canonical,
					$element_type
				);
				continue;
			}

			$merged[ $canonical ] = $resolved_value;
		}

		return $merged;
	}
}

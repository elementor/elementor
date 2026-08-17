<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared JSON Schema for V3 Advanced-tab basics (padding, margin, border, background).
 */
class V3_Advanced_Basics_Schema {

	const WIDGET_TYPE = 'v3-advanced-basics';

	const RESOURCE_URI = 'elementor://widgets/schema/v3-advanced-basics';

	private static ?array $cached_schema = null;

	/**
	 * @return array<string, array>
	 */
	public static function build(): array {
		if ( null !== self::$cached_schema ) {
			return self::$cached_schema;
		}

		$controls = self::canonical_control_stubs();
		$keys = array_keys( $controls );
		$built = V3_Json_Schema_Builder::build( $controls, $keys );

		self::$cached_schema = [
			'type' => 'object',
			'widget_version' => 'v3',
			'description' => 'Shared Advanced-tab basics for all V3 widgets: padding, margin, border, and background.',
			'properties' => $built['properties'],
			'required' => $built['required'],
			'additionalProperties' => false,
		];

		return self::$cached_schema;
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return array<string, array{ '$ref': string }>
	 */
	public static function property_refs_for_controls( array $controls ): array {
		$canonical = self::build()['properties'] ?? [];
		$refs = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $control ) ) {
				continue;
			}

			if ( ! V3_Style_Setting_Keys::is_advanced_basic_control( $control_key, $control ) ) {
				continue;
			}

			if ( ! isset( $canonical[ $control_key ] ) ) {
				continue;
			}

			$refs[ $control_key ] = [
				'$ref' => self::RESOURCE_URI . '#/properties/' . $control_key,
			];
		}

		return $refs;
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	private static function canonical_control_stubs(): array {
		$controls = [];

		foreach ( self::canonical_key_names() as $key ) {
			$controls[ $key ] = self::control_stub_for_key( $key );
		}

		return $controls;
	}

	/**
	 * @return string[]
	 */
	private static function canonical_key_names(): array {
		$keys = [];

		foreach ( V3_Style_Setting_Keys::ADVANCED_BASIC_PREFIXES as $prefix ) {
			$keys[] = $prefix;
			foreach ( V3_Style_Setting_Keys::RESPONSIVE_SUFFIXES as $suffix ) {
				$keys[] = $prefix . $suffix;
			}
		}

		return $keys;
	}

	/**
	 * @param string $key
	 * @return array<string, mixed>
	 */
	private static function control_stub_for_key( string $key ): array {
		$base = [
			'tab' => V3_Style_Setting_Keys::TAB_ADVANCED,
		];

		if ( str_ends_with( $key, '_color' ) || $key === '_background_color' ) {
			return array_merge( $base, [ 'type' => 'color' ] );
		}

		if ( str_ends_with( $key, '_image' ) ) {
			return array_merge( $base, [ 'type' => 'media' ] );
		}

		if ( str_ends_with( $key, '_border' ) || $key === '_background_background' ) {
			return array_merge( $base, [
				'type' => 'select',
				'options' => [
					'' => '',
					'solid' => 'solid',
				],
			] );
		}

		if (
			str_ends_with( $key, '_width' )
			|| str_ends_with( $key, '_radius' )
			|| str_ends_with( $key, '_padding' )
			|| str_ends_with( $key, '_margin' )
		) {
			return array_merge( $base, [ 'type' => 'dimensions' ] );
		}

		if ( str_ends_with( $key, '_position' ) || str_ends_with( $key, '_size' ) || str_ends_with( $key, '_repeat' ) ) {
			return array_merge( $base, [
				'type' => 'select',
				'options' => [
					'' => '',
					'center center' => 'center center',
				],
			] );
		}

		return array_merge( $base, [ 'type' => 'string' ] );
	}
}

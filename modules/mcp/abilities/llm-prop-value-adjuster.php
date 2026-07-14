<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Llm_Prop_Value_Adjuster {

	/**
	 * Adjusts an LLM-provided prop value to match the expected schema format.
	 * Mirrors the frontend's adjustLlmPropValueSchema function.
	 *
	 * @param mixed $value   The prop value to adjust.
	 * @param array $options Options for adjustment (force_key, transformers).
	 *
	 * @return mixed The adjusted prop value.
	 */
	public static function adjust( $value, array $options = [] ) {
		$force_key = $options['force_key'] ?? null;
		$transformers = $options['transformers'] ?? [];

		if ( ! is_array( $value ) ) {
			return null;
		}

		if ( array_is_list( $value ) ) {
			return array_map(
				fn( $item ) => self::adjust( $item, [
					'force_key' => $force_key,
					'transformers' => $transformers,
				] ),
				$value
			);
		}

		$clone = $value;

		if ( isset( $clone['$intention'] ) ) {
			unset( $clone['$intention'] );
		}

		if ( $force_key ) {
			$clone['$$type'] = $force_key;
		}

		$type = $clone['$$type'] ?? null;

		switch ( $type ) {
			case 'size':
				return self::adjust_size( $clone );

			case 'html-v3':
				return self::adjust_html_v3( $clone, $transformers );

			default:
				if ( isset( $transformers[ $type ] ) && is_callable( $transformers[ $type ] ) ) {
					return call_user_func( $transformers[ $type ], $clone['value'] ?? null );
				}
		}

		if ( isset( $clone['value'] ) && is_array( $clone['value'] ) ) {
			$clone['value'] = self::adjust_nested_value( $clone['value'], $transformers );
		}

		return $clone;
	}

	private static function adjust_nested_value( array $value, array $transformers ): array {
		if ( array_is_list( $value ) ) {
			return array_map(
				fn( $item ) => self::adjust( $item, [ 'transformers' => $transformers ] ),
				$value
			);
		}

		$adjusted = [];
		foreach ( $value as $key => $child_prop ) {
			$adjusted[ $key ] = self::adjust( $child_prop, [ 'transformers' => $transformers ] );
		}
		return $adjusted;
	}

	/**
	 * Adjusts a size prop value to the expected format.
	 */
	private static function adjust_size( array $value ): array {
		$raw_value = $value['value'] ?? [];

		$unit = is_string( $raw_value['unit'] ?? null )
			? $raw_value['unit']
			: self::extract_string_value( $raw_value['unit'] ?? null ) ?? 'px';

		$size = $raw_value['size'] ?? null;
		if ( is_array( $size ) && isset( $size['$$type'] ) ) {
			$size = self::extract_string_value( $size ) ?? self::extract_number_value( $size );
		}

		return [
			'$$type' => 'size',
			'value' => [
				'unit' => $unit,
				'size' => $size,
			],
		];
	}

	/**
	 * Adjusts an html-v3 prop value to the expected format.
	 */
	private static function adjust_html_v3( array $value, array $transformers ): array {
		$raw_value = $value['value'] ?? [];

		$children = isset( $raw_value['children'] ) && is_array( $raw_value['children'] )
			? $raw_value['children']
			: [];

		$adjusted_children = array_map(
			fn( $child ) => self::adjust( $child, [ 'transformers' => $transformers ] ),
			$children
		);

		return [
			'$$type' => 'html-v3',
			'value' => array_merge( $raw_value, [
				'children' => $adjusted_children,
			] ),
		];
	}

	/**
	 * Extracts a string value from a prop value envelope.
	 */
	private static function extract_string_value( $value ): ?string {
		if ( is_string( $value ) ) {
			return $value;
		}

		if ( is_array( $value ) && 'string' === ( $value['$$type'] ?? null ) ) {
			return $value['value'] ?? null;
		}

		return null;
	}

	/**
	 * Extracts a number value from a prop value envelope.
	 */
	private static function extract_number_value( $value ) {
		if ( is_numeric( $value ) ) {
			return $value;
		}

		if ( is_array( $value ) && 'number' === ( $value['$$type'] ?? null ) ) {
			return $value['value'] ?? null;
		}

		return null;
	}

	/**
	 * Creates the global variable transformers map.
	 * Mirrors the frontend's globalVariablesLLMResolvers.
	 *
	 * @param Variables_Service|null $variables_service The variables service for resolving IDs.
	 *
	 * @return array<string, callable> Map of $$type => transformer function.
	 */
	public static function create_global_variable_transformers( ?Variables_Service $variables_service ): array {
		if ( ! $variables_service ) {
			return [];
		}

		$create_resolver = function ( string $key ) use ( $variables_service ) {
			return function ( $value ) use ( $key, $variables_service ) {
				$id_or_label = is_string( $value ) ? $value : (string) $value;
				$variable = $variables_service->find_by_label_or_id( $id_or_label );

				return [
					'$$type' => $key,
					'value' => $variable ? $variable['id'] : $id_or_label,
				];
			};
		};

		return [
			'global-color-variable' => $create_resolver( 'global-color-variable' ),
			'global-font-variable' => $create_resolver( 'global-font-variable' ),
			'global-size-variable' => $create_resolver( 'global-size-variable' ),
		];
	}
}

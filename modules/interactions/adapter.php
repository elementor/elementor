<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Adapter {
	const VERSION_V1 = 1;
	const VERSION_V2 = 2;
	const ITEMS_TYPE = 'interactions-array';
	const TIMING_PROPERTIES = [ 'duration', 'delay' ];

	private const TO_MS = [
		'ms'  => 1,
		's'   => 1000,
	];

	public static function wrap_for_db( $interactions ) {
		$decoded = self::decode( $interactions );

		if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
			return $interactions;
		}

		$items = $decoded['items'];
		if ( isset( $decoded['items']['$$type'] ) && self::ITEMS_TYPE === $decoded['items']['$$type'] ) {
			$items = isset( $decoded['items']['value'] ) ? $decoded['items']['value'] : [];
		}

		$items = self::transform_items_timing_to_size( $items );

		$wrapped = [
			'items' => [
				'$$type' => self::ITEMS_TYPE,
				'value' => $items,
			],
			'version' => self::VERSION_V2,
		];

		return wp_json_encode( $wrapped );
	}

	public static function unwrap_for_frontend( $interactions ) {
		$decoded = self::decode( $interactions );

		if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
			return $interactions;
		}

		$items = $decoded['items'];
		if ( isset( $decoded['items']['$$type'] ) && self::ITEMS_TYPE === $decoded['items']['$$type'] ) {
			$items = isset( $decoded['items']['value'] ) ? $decoded['items']['value'] : [];
		}

		$items = self::transform_offsets_to_size( $items );

		$unwrapped = [
			'items' => $items,
			'version' => self::VERSION_V1,
		];

		return wp_json_encode( $unwrapped );
	}

	private static function transform_items_timing_to_size( $items ) {
		if ( ! is_array( $items ) ) {
			return $items;
		}

		foreach ( $items as &$item ) {
			if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
				continue;
			}

			$timing_config = $item['value']['animation']['value']['timing_config']['value'] ?? null;
			if ( $timing_config ) {
				if ( isset( $timing_config['duration'] ) && 'number' === ( $timing_config['duration']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['timing_config']['value']['duration'] = self::number_to_size( $timing_config['duration'], 'ms' );
				}

				if ( isset( $timing_config['delay'] ) && 'number' === ( $timing_config['delay']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['timing_config']['value']['delay'] = self::number_to_size( $timing_config['delay'], 'ms' );
				}
			}

			$config = $item['value']['animation']['value']['config']['value'] ?? null;
			if ( $config ) {
				if ( isset( $config['offsetTop'] ) && 'number' === ( $config['offsetTop']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetTop'] = self::number_to_size( $config['offsetTop'], '%' );
				}

				if ( isset( $config['offsetBottom'] ) && 'number' === ( $config['offsetBottom']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetBottom'] = self::number_to_size( $config['offsetBottom'], '%' );
				}
			}
		}

		return $items;
	}

	private static function transform_offsets_to_size( $items ) {
		if ( ! is_array( $items ) ) {
			return $items;
		}

		foreach ( $items as &$item ) {
			if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
				continue;
			}

			$config = $item['value']['animation']['value']['config']['value'] ?? null;
			if ( $config ) {
				if ( isset( $config['offsetTop'] ) && 'number' === ( $config['offsetTop']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetTop'] = self::number_to_size( $config['offsetTop'], '%' );
				}

				if ( isset( $config['offsetBottom'] ) && 'number' === ( $config['offsetBottom']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetBottom'] = self::number_to_size( $config['offsetBottom'], '%' );
				}
			}
		}

		return $items;
	}

	private static function number_to_size( $number_prop, $unit = 'ms' ) {
		$value = $number_prop['value'] ?? 0;

		return [
			'$$type' => 'size',
			'value' => [
				'size' => $value,
				'unit' => $unit,
			],
		];
	}

	private static function size_to_number( $size_prop ) {
		$size = $size_prop['value']['size'] ?? 0;

		return [
			'$$type' => 'number',
			'value' => $size,
		];
	}

	/**
	 * Recursively remove all $$type wrappers and extract plain values.
	 * Used specifically for frontend script output where we want clean data.
	 *
	 * Transforms: {"$$type": "string", "value": "fade"} → "fade"
	 * Transforms: {"$$type": "size", "value": {"size": 300, "unit": "ms"}} → {"size": 300, "unit": "ms"}
	 *
	 * @param mixed $data The data to clean.
	 * @return mixed The cleaned data without $$type markers.
	 */
	public static function clean_prop_types( $data, $parent_key = null ) {
		if ( ! is_array( $data ) ) {
			return $data;
		}

		// If this is a PropType object (has $$type), extract and clean its value
		if ( isset( $data['$$type'] ) ) {
			$value = $data['value'] ?? null;

			if ( 'size' === $data['$$type'] && in_array( $parent_key, self::TIMING_PROPERTIES, true ) ) {
				return self::size_to_milliseconds( $value );
			}

			return self::clean_prop_types( $value, $parent_key );
		}

		// Otherwise, recursively clean all array elements
		$cleaned = [];
		foreach ( $data as $key => $value ) {
			$cleaned[ $key ] = self::clean_prop_types( $value, $key );
		}

		return $cleaned;
	}

	private static function size_to_milliseconds( $size_value ) {
		if ( ! is_array( $size_value ) || ! isset( $size_value['size'] ) ) {
			return $size_value;
		}

		$size = $size_value['size'];
		$unit = $size_value['unit'] ?? 'ms';

		// Convert seconds to milliseconds
		if ( 's' === $unit ) {
			return $size * 1000;
		}

		// Already in milliseconds
		return $size;
	}

	/**
	 * Extract numeric value from a PropType that can be either 'number' or 'size'.
	 * - number format: {$$type: 'number', value: 300} → returns 300
	 * - size format: {$$type: 'size', value: {size: 300, unit: 'ms'}} → returns 300
	 *
	 * @param array $prop    The PropType array.
	 * @param mixed $default Default value if extraction fails.
	 * @return int|float|mixed The numeric value or default.
	 */
	public static function extract_numeric_value( $prop, $default = 0 ) {
		if ( ! is_array( $prop ) || ! isset( $prop['$$type'] ) ) {
			return $default;
		}

		if ( 'size' === $prop['$$type'] && is_array( $prop['value'] ?? null ) && isset( $prop['value']['size'] ) ) {
			return $prop['value']['size'];
		}

		if ( 'number' === $prop['$$type'] && isset( $prop['value'] ) ) {
			return $prop['value'];
		}

		return $default;
	}

	public static function extract_time_value( $prop, $default ) {
		$value = self::extract_numeric_value( $prop, $default );

		if ( 'number' === $prop['$$type'] ) {
			return $value;
		}

		return self::to_milliseconds( $value, $prop['value']['unit'] );
	}

	public static function to_milliseconds( int $value, string $unit ): int {
		$multiplier = self::TO_MS[ $unit ] ?? 1;

		return $value * $multiplier;
	}

	/**
	 * Decode interactions from string or return as-is if array.
	 */
	private static function decode( $interactions ) {
		if ( is_array( $interactions ) ) {
			return $interactions;
		}

		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( JSON_ERROR_NONE === json_last_error() && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return [];
	}
}

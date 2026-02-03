<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Adapter {
	const VERSION_V1 = 1;
	const VERSION_V2 = 2;
	const ITEMS_TYPE = 'interactions-array';

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

		$items = self::transform_items_timing_to_number( $items, $decoded['version'] );

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

	private static function transform_items_timing_to_number( $items, $version ) {
		if ( ! is_array( $items ) ) {
			return $items;
		}

		foreach ( $items as &$item ) {
			if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
				continue;
			}
// require_once $_SERVER['HOME'] . '/.composer/vendor/autoload.php';

			if ( $version === self::VERSION_V1 ) {
				$timing_config = $item['value']['animation']['value']['timing_config']['value'] ?? null;
				if ( $timing_config ) {
					if ( isset( $timing_config['duration'] ) && 'size' === ( $timing_config['duration']['$$type'] ?? null ) ) {
						$item['value']['animation']['value']['timing_config']['value']['duration'] = self::size_to_number( $timing_config['duration'] );
					}

					if ( isset( $timing_config['delay'] ) && 'size' === ( $timing_config['delay']['$$type'] ?? null ) ) {
						$item['value']['animation']['value']['timing_config']['value']['delay'] = self::size_to_number( $timing_config['delay'] );
					}
				}
			}

			$config = $item['value']['animation']['value']['config']['value'] ?? null;
			if ( $config ) {
				if ( isset( $config['offsetTop'] ) && 'size' === ( $config['offsetTop']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetTop'] = self::size_to_number( $config['offsetTop'] );
				}

				if ( isset( $config['offsetBottom'] ) && 'size' === ( $config['offsetBottom']['$$type'] ?? null ) ) {
					$item['value']['animation']['value']['config']['value']['offsetBottom'] = self::size_to_number( $config['offsetBottom'] );
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
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return [];
	}
}

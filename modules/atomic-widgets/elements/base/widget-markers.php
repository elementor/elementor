<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Widget_Markers {
	const WIDGET_KEY = 'widget';
	const PART_KEY = 'part';
	const SLOT_KEY = 'slot';
	const WIDGET_ID_PATTERN = '/^[a-z0-9-]+\/[a-z0-9-]+$/';
	const PART_PATTERN = '/^[a-z][a-z0-9_]*$/';
	const MIN_VERSION = 1;
	const MAX_VALUES_DEPTH = 3;

	public static function sanitize_widget( $value ): array {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$id = $value['id'] ?? null;
		$version = $value['version'] ?? null;

		if ( ! is_string( $id ) || ! preg_match( self::WIDGET_ID_PATTERN, $id ) ) {
			return [];
		}

		if ( ! is_int( $version ) || $version < self::MIN_VERSION ) {
			return [];
		}

		$marker = [
			'id' => $id,
			'version' => $version,
		];

		$values = self::sanitize_values( $value['values'] ?? [], 1 );

		if ( ! empty( $values ) ) {
			$marker['values'] = $values;
		}

		return $marker;
	}

	public static function sanitize_part( $value ): string {
		if ( ! is_string( $value ) || ! preg_match( self::PART_PATTERN, $value ) ) {
			return '';
		}

		return $value;
	}

	public static function sanitize_slot( $value ): bool {
		return true === $value;
	}

	private static function sanitize_values( $values, int $depth ): array {
		if ( ! is_array( $values ) || $depth > self::MAX_VALUES_DEPTH ) {
			return [];
		}

		$sanitized = [];

		foreach ( $values as $key => $value ) {
			if ( ! self::is_valid_values_key( $key ) ) {
				continue;
			}

			$sanitized_value = self::sanitize_value( $value, $depth );

			if ( null !== $sanitized_value ) {
				$sanitized[ $key ] = $sanitized_value;
			}
		}

		return $sanitized;
	}

	private static function is_valid_values_key( $key ): bool {
		return is_int( $key ) || 1 === preg_match( self::PART_PATTERN, $key );
	}

	private static function sanitize_value( $value, int $depth ) {
		if ( is_bool( $value ) || is_int( $value ) || is_float( $value ) ) {
			return $value;
		}

		if ( is_string( $value ) ) {
			return sanitize_text_field( $value );
		}

		if ( is_array( $value ) && $depth < self::MAX_VALUES_DEPTH ) {
			return self::sanitize_values( $value, $depth + 1 );
		}

		return null;
	}
}

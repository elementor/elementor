<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Handlers_Parser {
	const DATA_KEY = 'handlers';
	const ALLOWED_EVENTS = [ 'init', 'click', 'input', 'change', 'submit', 'mouseenter', 'mouseleave' ];
	const MAX_HANDLERS_PER_ELEMENT = 10;

	public static function sanitize( $handlers ): array {
		if ( is_string( $handlers ) ) {
			$handlers = json_decode( $handlers, true );
		}

		if ( ! is_array( $handlers ) ) {
			return [];
		}

		$valid_handlers = array_values( array_filter( $handlers, [ self::class, 'is_valid_handler' ] ) );

		$sanitized = array_map( fn( $handler ) => [
			'event' => $handler['event'],
			'code' => $handler['code'],
		], $valid_handlers );

		return array_slice( $sanitized, 0, self::MAX_HANDLERS_PER_ELEMENT );
	}

	public static function collect( array $elements ): array {
		$collected = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$handlers = self::sanitize( $element[ self::DATA_KEY ] ?? [] );

			if ( ! empty( $handlers ) && ! empty( $element['id'] ) ) {
				$collected[] = [
					'elementId' => $element['id'],
					'handlers' => $handlers,
				];
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$collected = array_merge( $collected, self::collect( $element['elements'] ) );
			}
		}

		return $collected;
	}

	public static function strip( array $elements ): array {
		return array_map( function ( $element ) {
			if ( ! is_array( $element ) ) {
				return $element;
			}

			unset( $element[ self::DATA_KEY ] );

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::strip( $element['elements'] );
			}

			return $element;
		}, $elements );
	}

	private static function is_valid_handler( $handler ): bool {
		return is_array( $handler )
			&& isset( $handler['event'], $handler['code'] )
			&& in_array( $handler['event'], self::ALLOWED_EVENTS, true )
			&& is_string( $handler['code'] )
			&& '' !== trim( $handler['code'] );
	}
}

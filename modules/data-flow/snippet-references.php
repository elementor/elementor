<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\DataFlow\Snippets\Snippet_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Snippet_References {
	const DATA_KEY = 'snippets';
	const MAX_PER_ELEMENT = 10;

	public static function sanitize( $references ): array {
		if ( ! is_array( $references ) ) {
			return [];
		}

		$valid = array_filter( $references, [ self::class, 'is_valid' ] );

		$sanitized = array_map( fn( $reference ) => [
			'snippet' => $reference['snippet'],
			'event' => $reference['event'],
		], array_values( $valid ) );

		return array_slice( $sanitized, 0, self::MAX_PER_ELEMENT );
	}

	public static function collect( array $elements ): array {
		$collected = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			$references = self::sanitize( $element[ self::DATA_KEY ] ?? [] );

			if ( ! empty( $references ) && ! empty( $element['id'] ) ) {
				$collected[] = [ 'elementId' => $element['id'], 'snippets' => $references ];
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

	private static function is_valid( $reference ): bool {
		return is_array( $reference )
			&& is_string( $reference['snippet'] ?? null )
			&& 1 === preg_match( Snippet_Validator::NAME_PATTERN, $reference['snippet'] )
			&& in_array( $reference['event'] ?? null, Snippet_Validator::ALLOWED_EVENTS, true );
	}
}

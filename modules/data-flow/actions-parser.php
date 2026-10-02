<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\DataFlow\Props\Actions_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Element `actions` are stored like interactions: `{ version, items }`, where every item is a validated and
 * sanitized `event-action` or `input-action` prop.
 */
class Actions_Parser {
	const DATA_KEY = 'actions';
	const VERSION = 1;
	const MAX_ITEMS = 20;

	public static function parse( $raw ): array {
		if ( is_string( $raw ) ) {
			$raw = json_decode( $raw, true );
		}

		$items = is_array( $raw ) ? ( $raw['items'] ?? [] ) : [];

		if ( ! is_array( $items ) ) {
			$items = [];
		}

		$item_type = Actions_Prop_Type::make()->get_item_type();
		$parsed = [];

		foreach ( $items as $item ) {
			if ( count( $parsed ) >= self::MAX_ITEMS ) {
				break;
			}

			if ( $item_type->validate( $item ) ) {
				$parsed[] = $item_type->sanitize( $item );
			}
		}

		return [
			'version' => self::VERSION,
			'items' => $parsed,
		];
	}

	public static function wrap( array $items ): array {
		return self::parse( [ 'items' => $items ] );
	}

	public static function to_runtime( $raw ): array {
		return Actions_Converter::to_plain( self::parse( $raw )['items'] );
	}

	public static function get_action_names( array $runtime_actions ): array {
		return array_values( array_unique( array_filter( array_column( $runtime_actions, 'do' ) ) ) );
	}
}

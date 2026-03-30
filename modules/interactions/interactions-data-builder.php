<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interactions_Data_Builder {

	public static function extract_interaction_items( $interactions ) {
		if ( ! is_array( $interactions ) ) {
			return [];
		}

		if ( isset( $interactions['items'] ) ) {
			$items = $interactions['items'];

			return is_array( $items ) ? $items : [];
		}

		$first_item = reset( $interactions );
		if ( is_array( $first_item ) && (
			isset( $first_item['trigger'] ) ||
			isset( $first_item['animation'] ) ||
			isset( $first_item['$$type'] )
		) ) {
			return $interactions;
		}

		return [];
	}

	public static function build_script_rows( array $elements ) {
		$rows = [];

		foreach ( self::collect_raw_by_element_id( $elements ) as $element_id => $interactions ) {
			$items = self::extract_interaction_items( $interactions );

			if ( empty( $items ) ) {
				continue;
			}

			$rows[] = [
				'elementId' => $element_id,
				'dataId' => $element_id,
				'interactions' => $items,
			];
		}

		return $rows;
	}

	public static function collect_into_collector( array $elements, Interactions_Collector $collector ) {
		foreach ( self::collect_raw_by_element_id( $elements ) as $element_id => $interactions ) {
			$collector->register( $element_id, $interactions );
		}
	}

	private static function collect_raw_by_element_id( array $elements ) {
		$map = [];
		self::collect_raw_recursive( $elements, $map );

		return $map;
	}

	private static function collect_raw_recursive( array $elements, array &$map ) {
		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( ! empty( $element['id'] ) && isset( $element['interactions'] ) ) {
				$element_id = $element['id'];
				$interactions = self::normalize_interactions_field( $element['interactions'] );

				if ( is_array( $interactions ) ) {
					$items = $interactions['items'] ?? [];
					if ( ! empty( $items ) || ! empty( $interactions ) ) {
						$map[ $element_id ] = $interactions;
					}
				}
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				self::collect_raw_recursive( $element['elements'], $map );
			}
		}
	}

	private static function normalize_interactions_field( $interactions ) {
		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
				$interactions = $decoded;
			} else {
				return null;
			}
		}

		if ( ! is_array( $interactions ) ) {
			return null;
		}

		if ( ! isset( $interactions['items'] ) ) {
			$first_item = reset( $interactions );
			if ( is_array( $first_item ) && (
				isset( $first_item['trigger'] ) ||
				isset( $first_item['animation'] ) ||
				isset( $first_item['$$type'] )
			) ) {
				$interactions = [ 'items' => $interactions ];
			}
		}

		return $interactions;
	}
}

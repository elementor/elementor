<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

class Global_Classes_Sanitizer {
	public static function make() {
		return new static();
	}

	/**
	 * @param mixed $data
	 *
	 * @return array{ items: array, order: array }
	 */
	public function sanitize( $data ) {
		$default = [
			'items' => [],
			'order' => [],
		];

		if ( ! isset( $data['items'], $data['order'] ) ) {
			return $default;
		}

		$items = $data['items'];
		$order = $data['order'];

		if ( ! is_array( $items ) || ! is_array( $order ) ) {
			return $default;
		}

		[$are_items_valid, $sanitized_items] = $this->sanitize_items( $items );

		if ( ! $are_items_valid ) {
			return $default;
		}

		[$is_order_valid, $sanitized_order] = $this->sanitize_order( $order, $sanitized_items );

		if ( ! $is_order_valid ) {
			return $default;
		}

		return [
			'items' => $sanitized_items,
			'order' => $sanitized_order,
		];
	}

	public function sanitize_items( array $items ) {
		$errors = [];
		$sanitized_items = [];

		foreach ( $items as $item_id => $item ) {
			[$is_item_valid, $sanitized_item, $item_errors] = Style_Parser::make( Style_Schema::get() )->parse( $item );

			if ( ! $is_item_valid ) {
				$errors[ $item_id ] = $item_errors;
				continue;
			}

			if ( $item_id !== $sanitized_item['id'] ) {
				$errors[ $item_id ] = [ 'id' ];

				continue;
			}

			$sanitized_items[ $sanitized_item['id'] ] = $sanitized_item;
		}

		$is_valid = count( $errors ) === 0;

		return [ $is_valid, $sanitized_items, $errors ];
	}

	public function sanitize_order( array $order, array $items ) {
		$order = array_filter( $order, fn( $item ) => is_string( $item ) );

		$existing_ids = array_keys( $items );

		$excess_ids = Collection::make( $order )->diff( $existing_ids );
		$missing_ids = Collection::make( $existing_ids )->diff( $order );

		$has_duplications = Collection::make( $order )->unique()->all() !== $order;

		$is_valid = (
			$excess_ids->is_empty() &&
			$missing_ids->is_empty() &&
			! $has_duplications
		);

		return [ $is_valid, $order ];
	}
}

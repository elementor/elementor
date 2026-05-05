<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

class Global_Classes_Parser {
	public static function make() {
		return new static();
	}

	public function parse( $data ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! isset( $data['items'] ) ) {
			$result->errors()->add( 'items', 'missing' );

			return $result;
		}

		if ( ! isset( $data['order'] ) ) {
			$result->errors()->add( 'order', 'missing' );

			return $result;
		}

		$items = $data['items'];
		$order = $data['order'];

		if ( ! is_array( $items ) ) {
			$result->errors()->add( 'items', 'invalid' );

			return $result;
		}

		if ( ! is_array( $order ) ) {
			$result->errors()->add( 'order', 'invalid' );

			return $result;
		}

		$items_result = $this->parse_items( $items );

		if ( ! $items_result->is_valid() ) {
			$result->errors()->merge( $items_result->errors(), 'items' );

			return $result;
		}

		$sanitized_items = $items_result->unwrap();

		$order_result = $this->parse_order( $order, array_keys( $sanitized_items ) );

		if ( ! $order_result->is_valid() ) {
			$result->errors()->merge( $order_result->errors(), 'order' );

			return $result;
		}

		$sanitized_order = $order_result->unwrap();

		return $result->wrap( [
			'items' => $sanitized_items,
			'order' => $sanitized_order,
		] );
	}

	public function parse_items( array $items ) {
		$sanitized_items = [];
		$result = Parse_Result::make();
		$style_parser = Style_Parser::make( Style_Schema::get() );

		foreach ( $items as $item_id => $item ) {
			$item_result = $style_parser->parse( $item );

			if ( ! $item_result->is_valid() ) {
				$result->errors()->merge( $item_result->errors(), $item_id );

				continue;
			}

			$sanitized_item = $item_result->unwrap();

			if ( $item_id !== $sanitized_item['id'] ) {
				$result->errors()->add( "$item_id.id", 'mismatching_value' );

				continue;
			}

			$sanitized_items[ $sanitized_item['id'] ] = $sanitized_item;
		}

		return $result->wrap( $sanitized_items );
	}

	public function parse_order( array $order, array $final_item_ids ) {
		$result = Parse_Result::make();

		$expected_ids = array_values( $final_item_ids );
		$order_unique = array_values( array_unique( array_filter( $order, 'is_string' ) ) );

		$missing_ids = array_diff( $expected_ids, $order_unique );
		$excess_ids = array_diff( $order_unique, $expected_ids );

		foreach ( $missing_ids as $id ) {
			$result->errors()->add( $id, 'missing' );
		}
		foreach ( $excess_ids as $id ) {
			$result->errors()->add( $id, 'excess' );
		}

		return $result->is_valid()
			? $result->wrap( $order_unique )
			: $result;
	}

	public static function check_for_duplicate_labels(
		array $label_by_id,
		array $deleted_ids,
		array $items,
		array $new_items_ids
	) {
		if ( empty( $new_items_ids ) ) {
			return [];
		}

		$new_added_items = array_filter(
			$items,
			fn( $item ) => in_array( $item['id'], $new_items_ids, true )
		);

		$duplicates = [];

		foreach ( $new_added_items as $item ) {
			$item_id = $item['id'];
			$label = $item['label'];

			foreach ( $label_by_id as $other_id => $other_label ) {
				if ( in_array( $other_id, $deleted_ids, true ) ) {
					continue;
				}

				if ( $other_id === $item_id ) {
					continue;
				}

				if ( $other_label === $label ) {
					$duplicates[] = [
						'item_id' => $item_id,
						'label' => $label,
					];
					break;
				}
			}
		}

		return $duplicates;
	}

	public static function sanitize_order( array $items, array $order ): array {
		if ( empty( $items ) ) {
			return [];
		}

		$item_ids = array_keys( $items );
		$order = array_filter( $order, 'is_string' );
		$order = array_unique( $order );
		$order_existing = array_values( array_intersect( $order, $item_ids ) );
		$missing = array_diff( $item_ids, $order_existing );
		sort( $missing, SORT_STRING );

		return array_merge( $order_existing, $missing );
	}
}

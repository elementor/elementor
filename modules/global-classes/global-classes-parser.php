<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Parsers\Parse_Result;
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
		}

		if ( ! isset( $data['order'] ) ) {
			$result->errors()->add( 'order', 'missing' );
		}

		$items = $data['items'];
		$order = $data['order'];

		if ( ! is_array( $items ) ) {
			$result->errors()->add( 'items', 'invalid' );
		}

		if ( ! is_array( $order ) ) {
			$result->errors()->add( 'order', 'invalid' );
		}

		$items_result = $this->parse_items( $items );

		if ( ! $items_result->is_valid() ) {
			$result->errors()->merge( $items_result->errors(), 'items' );
		}

		$order_result = $this->parse_order( $order, $items_result->unwrap() );

		if ( ! $order_result->is_valid() ) {
			$result->errors()->merge( $order_result->errors(), 'order' );
		}

		return $result->wrap( [
			'items' => $items_result->unwrap(),
			'order' => $order_result->unwrap(),
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

	public function parse_order( array $order, array $items ): Parse_Result {
		$result = Parse_Result::make();

		$order = Collection::make( $order )->filter( fn( $item ) => is_string( $item ) );

		$existing_ids = array_keys( $items );

		$excess_ids = $order->diff( $existing_ids );
		$missing_ids = Collection::make( $existing_ids )->diff( $order );

		$unique_ids = $order->unique();
		$duplicate_ids = $order->diff_assoc( $unique_ids );

		if ( ! $excess_ids->is_empty() ) {
			$excess_ids->each( fn( $id ) => $result->errors()->add( $id, 'excess' ) );
		}

		if ( ! $missing_ids->is_empty() ) {
			$missing_ids->each( fn( $id ) => $result->errors()->add( $id, 'missing' ) );
		}

		if ( ! $duplicate_ids->is_empty() ) {
			$duplicate_ids->each( fn( $id ) => $result->errors()->add( $id, 'duplicated' ) );
		}

		return $result->wrap( $order->all() );
	}
}

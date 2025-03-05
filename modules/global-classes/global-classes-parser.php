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

		$order_result = $this->parse_order( $order, $items_result->unwrap() );

		if ( ! $order_result->is_valid() ) {
			$result->errors()->merge( $order_result->errors(), 'order' );

			return $result;
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

		$items = Collection::make( $items );

		$order = Collection::make( $order )
			->filter( fn( $item ) => is_string( $item ) )
			->unique();

		$existing_ids = $items->keys();

		$excess_ids = $order->diff( $existing_ids );
		$missing_ids = $existing_ids->diff( $order );

		$excess_ids->each( fn( $id ) => $result->errors()->add( $id, 'excess' ) );
		$missing_ids->each( fn( $id ) => $result->errors()->add( $id, 'missing' ) );

		return $result->is_valid()
			? $result->wrap( $order->values() )
			: $result;
	}
}

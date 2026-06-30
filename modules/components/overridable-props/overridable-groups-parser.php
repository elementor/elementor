<?php

namespace Elementor\Modules\Components\OverridableProps;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Utils\Parsing_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Overridable_Groups_Parser {
	public static function make(): self {
		return new static();
	}

	public function parse( array $groups ): Parse_Result {
		$result = Parse_Result::make();

		$structure_validation_result = $this->validate_structure( $groups );

		if ( ! $structure_validation_result->is_valid() ) {
			return $structure_validation_result;
		}

		$parsed_groups = $this->parse_groups_items( $groups['items'] );
		if ( ! $parsed_groups->is_valid() ) {
			$result->errors()->merge( $parsed_groups->errors() );

			return $result;
		}

		$parsed_order = $this->parse_groups_order( $groups['order'] );
		if ( ! $parsed_order->is_valid() ) {
			$result->errors()->merge( $parsed_order->errors() );

			return $result;
		}

		$validation_result = $this->validate( $parsed_groups->unwrap(), $parsed_order->unwrap() );

		if ( ! $validation_result->is_valid() ) {
			return $validation_result;
		}

		$sanitized_groups = $this->sanitize( $parsed_groups->unwrap(), $parsed_order->unwrap() );

		return Parse_Result::make()->wrap( $sanitized_groups );
	}

	private function validate_structure( array $groups ): Parse_Result {
		$result = Parse_Result::make();

		$inner_fields = [ 'items', 'order' ];

		foreach ( $inner_fields as $inner_field ) {
			if ( ! isset( $groups[ $inner_field ] ) ) {
				$result->errors()->add( "groups.$inner_field", 'missing' );

				return $result;
			}

			if ( ! is_array( $groups[ $inner_field ] ) ) {
				$result->errors()->add( "groups.$inner_field", 'invalid_structure' );

				return $result;
			}
		}

		foreach ( $groups['items'] as $group_id => $group ) {
			if ( ! is_array( $group ) ) {
				$result->errors()->add( "groups.items.$group_id", 'invalid_structure' );

				continue;
			}

			$required_fields = [ 'id', 'label', 'props' ];

			foreach ( $required_fields as $field ) {
				if ( ! isset( $group[ $field ] ) ) {
					$result->errors()->add( "groups.items.$group_id.$field", 'missing' );
				}
			}

			if ( isset( $group['props'] ) && ! is_array( $group['props'] ) ) {
				$result->errors()->add( "groups.items.$group_id.props", 'invalid_structure' );
			}
		}

		return $result;
	}

	private function validate( array $items, array $order ): Parse_Result {
		$result = Parse_Result::make();

		$items_ids_collection = Collection::make( $items )->keys();
		$order_collection = Collection::make( $order );

		$excess_ids = $order_collection->diff( $items_ids_collection );
		$missing_ids = $items_ids_collection->diff( $order_collection );

		$excess_ids->each( fn( $id ) => $result->errors()->add( "groups.order.$id", 'excess' ) );
		$missing_ids->each( fn( $id ) => $result->errors()->add( "groups.order.$id", 'missing' ) );

		return $result;
	}

	private function parse_groups_items( array $items ): Parse_Result {
		$result = Parse_Result::make();

		$validate_groups_items_result = $this->validate_groups_items( $items );

		if ( ! $validate_groups_items_result->is_valid() ) {
			$result->errors()->merge( $validate_groups_items_result->errors() );

			return $result;
		}

		return Parse_Result::make()->wrap( $this->sanitize_groups_items( $items ) );
	}

	private function validate_groups_items( array $items ): Parse_Result {
		$result = Parse_Result::make();

		$labels = [];

		foreach ( $items as $group_id => $group ) {
			if ( $group_id !== $group['id'] ) {
				$result->errors()->add( "groups.items.$group_id.id", 'mismatching_value' );
			}

			$duplicate_props = Parsing_Utils::get_duplicates( $group['props'] );

			if ( ! empty( $duplicate_props ) ) {
				$result->errors()->add( "groups.items.$group_id.props", 'duplicate_props: ' . implode( ', ', $duplicate_props ) );
			}

			$labels[] = $group['label'];
		}

		$duplicate_labels = Parsing_Utils::get_duplicates( $labels );

		if ( ! empty( $duplicate_labels ) ) {
			$result->errors()->add( 'groups.items', 'duplicate_labels: ' . implode( ', ', $duplicate_labels ) );
		}

		return $result;
	}

	private function parse_groups_order( array $order ): Parse_Result {
		$result = Parse_Result::make();

		$validate_groups_order_result = $this->validate_groups_order( $order );

		if ( ! $validate_groups_order_result->is_valid() ) {
			return $validate_groups_order_result;
		}

		return Parse_Result::make()->wrap( $this->sanitize_groups_order( $order ) );
	}

	private function validate_groups_order( array $order ): Parse_Result {
		$result = Parse_Result::make();

		$order_collection = Collection::make( $order );
		$non_string_items = $order_collection->some( fn( $item ) => ! is_string( $item ) );

		if ( $non_string_items ) {
			$result->errors()->add( 'groups.order', 'non_string_items' );

			return $result;
		}

		if ( Parsing_Utils::get_duplicates( $order ) ) {
			$result->errors()->add( 'groups.order', 'duplicate_ids' );

			return $result;
		}

		return $result;
	}

	private function sanitize( array $items, array $order ): array {
		return [
			'items' => $items,
			'order' => $order,
		];
	}

	private function sanitize_groups_items( array $items ): array {
		$sanitized_items = [];

		foreach ( $items as $group_id => $group ) {
			$sanitized_group_id = sanitize_key( $group_id );
			$sanitized_items[ $sanitized_group_id ] = $this->sanitize_single_group( $group );
		}

		return $sanitized_items;
	}

	private function sanitize_single_group( array $group ): array {
		return [
			'id' => sanitize_key( $group['id'] ),
			'label' => sanitize_text_field( $group['label'] ),
			'props' => array_map( 'sanitize_key', $group['props'] ),
		];
	}

	private function sanitize_groups_order( array $order ): array {
		return Collection::make( $order )
			->map( fn( $item ) => sanitize_key( $item ) )
			->values();
	}
}

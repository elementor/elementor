<?php

namespace Elementor\Modules\Components\Documents;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Overridable_Props_Parser {
	public static function make(): self {
		return new static();
	}

	public function parse( $data ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! is_array( $data ) ) {
			$result->errors()->add( 'component_overridable_props', 'invalid_structure' );

			return $result;
		}

		if ( empty( $data ) ) {
			return $result->wrap( [] );
		}

		if ( ! isset( $data['props'] ) ) {
			$result->errors()->add( 'props', 'missing' );

			return $result;
		}

		if ( ! isset( $data['groups'] ) ) {
			$result->errors()->add( 'groups', 'missing' );

			return $result;
		}

		$props = $data['props'];
		$groups = $data['groups'];

		if ( ! is_array( $props ) ) {
			$result->errors()->add( 'props', 'invalid_structure' );

			return $result;
		}

		if ( ! is_array( $groups ) ) {
			$result->errors()->add( 'groups', 'invalid_structure' );

			return $result;
		}

		if ( empty( $props ) && empty( $groups ) ) {
			return $result->wrap( [] );
		}

		$props_result = $this->parse_props( $props );

		if ( ! $props_result->is_valid() ) {
			$result->errors()->merge( $props_result->errors() );

			return $result;
		}

		$groups_result = $this->parse_groups( $groups, $props_result->unwrap() );

		if ( ! $groups_result->is_valid() ) {
			$result->errors()->merge( $groups_result->errors() );

			return $result;
		}

		$cross_validation_result = $this->cross_validate_props_and_groups(
			$props_result->unwrap(),
			$groups_result->unwrap()
		);

		if ( ! $cross_validation_result->is_valid() ) {
			$result->errors()->merge( $cross_validation_result->errors() );

			return $result;
		}

		return $result->wrap( [
			'props' => $props_result->unwrap(),
			'groups' => $groups_result->unwrap(),
		] );
	}

	private function parse_props( array $props ): Parse_Result {
		$sanitized_props = [];
		$result = Parse_Result::make();

		foreach ( $props as $prop_id => $prop ) {
			if ( ! is_array( $prop ) ) {
				$result->errors()->add( "props.$prop_id", 'invalid_structure' );

				continue;
			}

			$prop_result = $this->parse_single_prop( $prop_id, $prop );

			if ( ! $prop_result->is_valid() ) {
				$result->errors()->merge( $prop_result->errors(), "props.$prop_id" );

				continue;
			}

			$sanitized_prop = $prop_result->unwrap();
			$sanitized_prop_id = sanitize_key( $prop_id );

			if ( $sanitized_prop_id != $sanitized_prop['overrideKey'] ) {
				$result->errors()->add( "props.$sanitized_prop_id", 'mismatching_override_key' );

				continue;
			}

			$sanitized_props[ $sanitized_prop_id ] = $sanitized_prop;
		}

		$duplicate_prop_keys_for_same_element = $this->get_duplicates( array_map( fn( $prop ) => $prop['elementId'] . '.' . $prop['propKey'], $sanitized_props ) );

		if ( ! empty( $duplicate_prop_keys_for_same_element ) ) {
			$result->errors()->add( 'props', 'duplicate_prop_keys_for_same_element: ' . implode( ', ', $duplicate_prop_keys_for_same_element ) );

			return $result;
		}

		return $result->wrap( $sanitized_props );
	}

	private function parse_single_prop( string $prop_id, array $prop ): Parse_Result {
		$result = Parse_Result::make();

		$required_fields = [
			'overrideKey',
			'label',
			'elementId',
			'elType',
			'widgetType',
			'propKey',
			'originalValue',
			'groupId',
		];

		foreach ( $required_fields as $field ) {
			if ( ! isset( $prop[ $field ] ) ) {
				$result->errors()->add( $field, 'missing_field' );
			}
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		if ( ! is_array( $prop['originalValue'] ) ) {
			$result->errors()->add( 'originalValue', 'invalid' );

			return $result;
		}

		if ( ! isset( $prop['originalValue']['$$type'] ) || ! isset( $prop['originalValue']['value'] ) ) {
			$result->errors()->add( 'originalValue', 'missing_required_fields' );

			return $result;
		}

		$sanitized_prop = [
			'overrideKey' => sanitize_key( $prop['overrideKey'] ),
			'label' => sanitize_text_field( $prop['label'] ),
			'elementId' => sanitize_key( $prop['elementId'] ),
			'propKey' => sanitize_text_field( $prop['propKey'] ),
			'widgetType' => sanitize_text_field( $prop['widgetType'] ),
			'elType' => sanitize_text_field( $prop['elType'] ),
			'originalValue' => [
				'$$type' => sanitize_text_field( $prop['originalValue']['$$type'] ),
				'value' => $this->sanitize_value( $prop['originalValue']['value'] ),
			],
			'groupId' => sanitize_key( $prop['groupId'] ),
		];

		return $result->wrap( $sanitized_prop );
	}

	private function sanitize_value( $value ) {
		if ( is_string( $value ) ) {
			return sanitize_text_field( $value );
		}

		if ( is_array( $value ) ) {
			return array_map( [ $this, 'sanitize_value' ], $value );
		}

		return $value;
	}

	private function parse_groups( array $groups, array $props ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! isset( $groups['items'] ) ) {
			$result->errors()->add( 'groups.items', 'missing' );

			return $result;
		}

		if ( ! isset( $groups['order'] ) ) {
			$result->errors()->add( 'groups.order', 'missing' );

			return $result;
		}

		$items = $groups['items'];
		$order = $groups['order'];

		if ( ! is_array( $items ) ) {
			$result->errors()->add( 'groups.items', 'invalid_structure' );

			return $result;
		}

		if ( ! is_array( $order ) ) {
			$result->errors()->add( 'groups.order', 'invalid_structure' );

			return $result;
		}

		$items_result = $this->parse_group_items( $items );

		if ( ! $items_result->is_valid() ) {
			$result->errors()->merge( $items_result->errors(), 'groups' );

			return $result;
		}

		$order_result = $this->parse_groups_order( $order, $items_result->unwrap() );

		if ( ! $order_result->is_valid() ) {
			$result->errors()->merge( $order_result->errors(), 'groups.order' );

			return $result;
		}

		return $result->wrap( [
			'items' => $items_result->unwrap(),
			'order' => $order_result->unwrap(),
		] );
	}

	private function parse_group_items( array $items ): Parse_Result {
		$sanitized_items = [];
		$labels = [];

		$result = Parse_Result::make();

		foreach ( $items as $group_id => $group ) {
			if ( ! is_array( $group ) ) {
				$result->errors()->add( $group_id, 'invalid_structure' );

				continue;
			}

			$group_result = $this->parse_single_group( $group_id, $group );

			if ( ! $group_result->is_valid() ) {
				$result->errors()->merge( $group_result->errors(), "items.$group_id" );

				continue;
			}

			$sanitized_group = $group_result->unwrap();
			$sanitized_group_id = sanitize_key( $group_id );

			if ( $sanitized_group_id !== $sanitized_group['id'] ) {
				$result->errors()->add( "items.$sanitized_group_id.id", 'mismatching_value' );

				continue;
			}

			$sanitized_items[ $sanitized_group_id ] = $sanitized_group;
			$labels[] = $sanitized_group['label'];
		}

		$duplicate_labels = $this->get_duplicates( $labels );

		if ( ! empty( $duplicate_labels ) ) {
			$result->errors()->add( 'items', 'duplicate_labels: ' . implode( ', ', $duplicate_labels ) );

			return $result;
		}

		return $result->wrap( $sanitized_items );
	}

	private function parse_single_group( string $group_id, array $group ): Parse_Result {
		$result = Parse_Result::make();
		$props_labels = [];

		$required_fields = [ 'id', 'label', 'props' ];

		foreach ( $required_fields as $field ) {
			if ( ! isset( $group[ $field ] ) ) {
				$result->errors()->add( $field, 'missing' );
			}
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		if ( ! is_array( $group['props'] ) ) {
			$result->errors()->add( 'props', 'invalid_structure' );

			return $result;
		}

		$sanitized_group = [
			'id' => sanitize_key( $group['id'] ),
			'label' => sanitize_text_field( $group['label'] ),
			'props' => array_map( 'sanitize_key', $group['props'] ),
		];

		$duplicate_props = $this->get_duplicates( $sanitized_group['props'] );

		if ( ! empty( $duplicate_props ) ) {
			$result->errors()->add( "groups.items.$group_id.props", 'duplicate_props: ' . implode( ', ', $duplicate_props ) );

			return $result;
		}

		return $result->wrap( $sanitized_group );
	}

	private function parse_groups_order( array $order, array $groups ): Parse_Result {
		$result = Parse_Result::make();
		$groups = Collection::make( $groups );

		$order = Collection::make( $order )
			->filter( fn( $item ) => is_string( $item ) )
			->map( fn( $item ) => sanitize_key( $item ) )
			->unique();

		$existing_ids = $groups->keys();

		$excess_ids = $order->diff( $existing_ids );
		$missing_ids = $existing_ids->diff( $order );

		$excess_ids->each( fn( $id ) => $result->errors()->add( $id, 'excess' ) );
		$missing_ids->each( fn( $id ) => $result->errors()->add( $id, 'missing' ) );

		return $result->is_valid()
			? $result->wrap( $order->values() )
			: $result;
	}
	private function cross_validate_props_and_groups( array $props, array $groups ): Parse_Result {
		$result = Parse_Result::make();

		$group_items = $groups['items'];

		$props_in_groups = [];

		foreach ( $group_items as $group_id => $group ) {
			foreach ( $group['props'] as $prop_id ) {
				if ( ! isset( $props[ $prop_id ] ) ) {
					$result->errors()->add( "groups.items.$group_id.props", "prop_not_found: $prop_id" );
				} else {
					$props_in_groups[ $prop_id ] = $group_id;
				}
			}
		}

		foreach ( $props as $prop_id => $prop ) {
			if ( $prop['groupId'] !== $props_in_groups[ $prop_id ] ) {
				$result->errors()->add( "props.$prop_id.groupId", 'mismatching_value_with_groups.items.props' );
			}
		}

		$duplicate_labels_result = $this->check_duplicate_labels_within_groups( $groups['items'], $props );

		if ( ! $duplicate_labels_result->is_valid() ) {
			$result->errors()->merge( $duplicate_labels_result->errors(), 'groups.items' );
		}

		return $result;
	}

	private function check_duplicate_labels_within_groups( array $groups, array $props ): Parse_Result {
		$result = Parse_Result::make();

		foreach ( $groups as $group_id => $group ) {
			$group_props = $group['props'];
			$labels = array_map( fn( $prop_id ) => $props[ $prop_id ]['label'], $group_props );
			$duplicate_labels = $this->get_duplicates( $labels );

			if ( ! empty( $duplicate_labels ) ) {
				$result->errors()->add( "$group_id.props", 'duplicate_labels: ' . implode( ', ', $duplicate_labels ) );
			}
		}

		return $result;
	}


	private function get_duplicates( array $array ): array {
		$duplicates = [];
		$seen = [];

		foreach ( $array as $item ) {
			if ( in_array( $item, $seen, true ) ) {
				if ( ! in_array( $item, $duplicates, true ) ) {
					$duplicates[] = $item;
				}
			} else {
				$seen[] = $item;
			}
		}

		return $duplicates;
	}
}

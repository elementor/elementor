<?php

namespace Elementor\Modules\Components\OverridableProps;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\Components\Utils\Parsing_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates and sanitizes component overridable props object.
 *
 * Valid input example:
 * ```
 * [
 *     'props' => [
 *         'prop1_UUID' => [
 *             'overrideKey' => 'prop1_UUID',
 *             'label' => 'User Name',
 *             'elementId' => '90d25e3',
 *             'propKey' => 'title',
 *             'elType' => 'widget',
 *             'widgetType' => 'e-heading',
 *             'originValue' => [
 *                 '$$type' => 'html',
 *                 'value' => 'Jane Smith',
 *             ],
 *             'groupId' => 'group1_UUID',
 *         ],
 *     ],
 *     'groups' => [
 *         'items' => [
 *             'group1_UUID' => [
 *                 'id' => 'group1_UUID',
 *                 'label' => 'User Info',
 *                 'props' => [ 'prop1_UUID' ],
 *             ],
 *         ],
 *         'order' => [ 'group1_UUID' ],
 *     ],
 * ];
 * ```
 */
class Component_Overridable_Props_Parser {
	private Overridable_Props_Parser $props_parser;
	private Overridable_Groups_Parser $groups_parser;

	public function __construct(
		Overridable_Props_Parser $props_parser,
		Overridable_Groups_Parser $groups_parser
	) {
		$this->props_parser = $props_parser;
		$this->groups_parser = $groups_parser;
	}

	public static function make(): self {
		return new static(
			Overridable_Props_Parser::make(),
			Overridable_Groups_Parser::make()
		);
	}

	/**
	 * @param array $data
	 *
	 * @return Parse_Result
	 */
	public function parse( array $data ): Parse_Result {
		$result = Parse_Result::make();

		if ( empty( $data ) ) {
			return $result->wrap( [] );
		}

		$inner_fields_structure_result = $this->validate_inner_fields_structure( $data );

		if ( ! $inner_fields_structure_result->is_valid() ) {
			$result->errors()->merge( $inner_fields_structure_result->errors() );

			return $result;
		}

		if ( empty( $data['props'] ) && empty( $data['groups'] ) ) {
			return $result->wrap( [] );
		}

		$props_result = $this->props_parser->parse( $data['props'] );

		if ( ! $props_result->is_valid() ) {
			$result->errors()->merge( $props_result->errors() );

			return $result;
		}

		$groups_result = $this->groups_parser->parse( $data['groups'] );

		if ( ! $groups_result->is_valid() ) {
			$result->errors()->merge( $groups_result->errors() );

			return $result;
		}

		$parsed_props = $props_result->unwrap();
		$parsed_groups = $groups_result->unwrap();

		$validation_result = $this->validate( $parsed_props, $parsed_groups );

		if ( ! $validation_result->is_valid() ) {
			$result->errors()->merge( $validation_result->errors() );

			return $result;
		}

		return $this->sanitize( $parsed_props, $parsed_groups );
	}

	private function validate_inner_fields_structure( array $data ): Parse_Result {
		$result = Parse_Result::make();

		$inner_fields = [ 'props', 'groups' ];

		foreach ( $inner_fields as $inner_field ) {
			if ( ! isset( $data[ $inner_field ] ) ) {
				$result->errors()->add( $inner_field, 'missing' );

				return $result;
			}

			if ( ! is_array( $data[ $inner_field ] ) ) {
				$result->errors()->add( $inner_field, 'invalid_structure' );

				return $result;
			}
		}

		return $result;
	}

	private function validate( array $props, array $groups ): Parse_Result {
		$result = Parse_Result::make();

		$group_items = $groups['items'];

		$props_in_groups = [];

		foreach ( $group_items as $group_id => $group ) {
			foreach ( $group['props'] as $prop_id ) {
				if ( ! isset( $props[ $prop_id ] ) ) {
					$result->errors()->add( "groups.items.$group_id.props.$prop_id", 'prop_not_found_in_props' );
				} else {
					$props_in_groups[ $prop_id ] = $group_id;
				}
			}
		}

		foreach ( $props as $prop_id => $prop ) {
			if ( ! isset( $props_in_groups[ $prop_id ] ) || $prop['groupId'] !== $props_in_groups[ $prop_id ] ) {
				$result->errors()->add( "props.$prop_id.groupId", 'mismatching_value_with_groups.items.props' );
			}
		}

		$duplicate_labels_result = $this->check_duplicate_labels_within_groups( $group_items, $props );

		if ( ! $duplicate_labels_result->is_valid() ) {
			$result->errors()->merge( $duplicate_labels_result->errors(), 'groups.items' );
		}

		return $result;
	}

	private function sanitize( array $props, array $groups ): Parse_Result {
		return Parse_Result::make()->wrap( [
			'props' => $props,
			'groups' => $groups,
		] );
	}

	private function check_duplicate_labels_within_groups( array $groups, array $props ): Parse_Result {
		$result = Parse_Result::make();

		foreach ( $groups as $group_id => $group ) {
			$group_props = $group['props'];
			$labels = array_map( fn( $prop_id ) => $props[ $prop_id ]['label'], $group_props );
			$duplicate_labels = Parsing_Utils::get_duplicates( $labels );

			if ( ! empty( $duplicate_labels ) ) {
				$result->errors()->add( "$group_id.props", 'duplicate_labels: ' . implode( ', ', $duplicate_labels ) );
			}
		}

		return $result;
	}
}

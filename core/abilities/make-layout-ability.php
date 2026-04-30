<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Declarative layout composer. Builds a weighted multi-column (or multi-row) e-flexbox
 * tree from a compact column spec, wiring flex-grow proportions as local styles automatically.
 *
 * Collapses the most common pattern — a row with N proportionally-sized columns, each
 * holding a stack of widgets — into a single call. The output is a ready-to-paste element
 * node identical in shape to what make-widget produces, and compatible with build-page /
 * set-post-content / append-element.
 *
 * Keeps payloads small: instead of sending N pre-built flexbox nodes (each with their own
 * style blocks written out in full), the caller sends a compact declarative spec and
 * make-layout does the wiring.
 */
class Make_Layout_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/make-layout';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Make Layout',
			'description' => 'Builds a weighted multi-column/row e-flexbox tree from a compact spec. Wires flex-grow proportions as local styles. Use instead of hand-rolling nested flexbox nodes.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'direction' => [
						'type'        => 'string',
						'description' => 'flex-direction for the outer container. "row" (default) for horizontal columns, "column" for vertical stacking.',
					],
					'id' => [
						'type'        => 'string',
						'description' => 'ID for the outer container. Auto-generated when omitted.',
					],
					'style_id' => [
						'type'        => 'string',
						'description' => 'Local style ID to attach to the outer container. Auto-mirrored into classes.value.',
					],
					'classes' => [
						'type'        => 'array',
						'description' => 'Global class IDs or labels for the outer container.',
						'items'       => [ 'type' => 'string' ],
					],
					'columns' => [
						'type'        => 'array',
						'description' => 'Ordered list of column (or row) specs.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'weight' => [
									'type'        => 'number',
									'description' => 'flex-grow weight. Columns with weight 2 take twice the space of weight 1. Default: 1.',
								],
								'id' => [
									'type'        => 'string',
									'description' => 'ID for this column container. Auto-generated when omitted.',
								],
								'style_id' => [
									'type'        => 'string',
									'description' => 'Local style ID for this column (for spacing, background, etc). Auto-generated flex-weight style is separate and always added.',
								],
								'classes' => [
									'type'        => 'array',
									'description' => 'Global class IDs or labels for this column container.',
									'items'       => [ 'type' => 'string' ],
								],
								'elements' => [
									'type'        => 'array',
									'description' => 'Children element nodes (output of make-widget or any valid element). Can be empty.',
								],
							],
							'additionalProperties' => false,
						],
					],
				],
				'required'             => [ 'columns' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'element' => [
						'type'        => 'object',
						'description' => 'Ready-to-paste outer e-flexbox node containing weighted column/row containers.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Builds a weighted multi-column (or multi-row) e-flexbox tree from a compact spec — no need to hand-roll nested flexbox nodes with flex-grow styles.',
						'direction: "row" (default) = horizontal columns side-by-side. "column" = vertical stack.',
						'columns[].weight: flex-grow value. weight:2 + weight:1 = 2:1 split (66%/33%). All equal weights = even split. Default: 1.',
						'columns[].elements: array of pre-built widget nodes (make-widget output or any valid element node). Can be empty.',
						'columns[].style_id / columns[].classes: for extra styling (padding, background) on a column — the flex-weight local style is added automatically as a separate style entry.',
						'The outer container gets a flex-direction local style from the `direction` input. Pass style_id/classes for additional outer styling.',
						'Output is a single e-flexbox node — pass it directly to build-page elements[], set-post-content elements[], or append-element element.',
						'PAYLOAD TIP: build-page has an MCP object-size limit (~20–25KB JSON). For large trees, compose the layout with make-layout + make-widget to generate compact nodes, then send a single build-page call. If still too large, use append-element to add the pre-built node to a post that already has the page skeleton.',
						'FLEX PROP FORMAT (for manual flex in local styles): {"$$type":"flex","value":{"flexGrow":{"$$type":"number","value":2},"flexShrink":{"$$type":"number","value":0},"flexBasis":{"$$type":"size","value":{"size":0,"unit":"px"}}}}. flexShrink and flexBasis are optional.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$direction = isset( $input['direction'] ) && is_string( $input['direction'] ) ? $input['direction'] : 'row';
		$outer_id  = isset( $input['id'] ) && is_string( $input['id'] ) && '' !== $input['id'] ? $input['id'] : Utils::generate_id();
		$columns   = $input['columns'] ?? [];

		$outer_style_id  = isset( $input['style_id'] ) && is_string( $input['style_id'] ) && '' !== $input['style_id'] ? $input['style_id'] : null;
		$outer_classes   = isset( $input['classes'] ) && is_array( $input['classes'] ) ? $input['classes'] : [];

		// Build the outer flex-direction local style.
		$outer_dir_style_id = $outer_id . '-dir';
		$outer_styles       = [
			$outer_dir_style_id => $this->make_style(
				$outer_dir_style_id,
				[ 'flex-direction' => $this->make_string( $direction ) ]
			),
		];
		$outer_class_values = [ $outer_dir_style_id ];

		if ( null !== $outer_style_id ) {
			$outer_class_values[] = $outer_style_id;
		}
		foreach ( $outer_classes as $c ) {
			if ( is_string( $c ) && '' !== $c ) {
				$outer_class_values[] = $c;
			}
		}

		$column_nodes = [];

		foreach ( $columns as $col_spec ) {
			if ( ! is_array( $col_spec ) ) {
				continue;
			}

			$col_id       = isset( $col_spec['id'] ) && is_string( $col_spec['id'] ) && '' !== $col_spec['id'] ? $col_spec['id'] : Utils::generate_id();
			$weight       = isset( $col_spec['weight'] ) && is_numeric( $col_spec['weight'] ) ? (float) $col_spec['weight'] : 1.0;
			$col_style_id = isset( $col_spec['style_id'] ) && is_string( $col_spec['style_id'] ) && '' !== $col_spec['style_id'] ? $col_spec['style_id'] : null;
			$col_classes  = isset( $col_spec['classes'] ) && is_array( $col_spec['classes'] ) ? $col_spec['classes'] : [];
			$col_elements = isset( $col_spec['elements'] ) && is_array( $col_spec['elements'] ) ? array_values( $col_spec['elements'] ) : [];

			// Auto-generate the flex-grow local style for this column.
			$flex_style_id = $col_id . '-flex';
			$col_styles    = [
				$flex_style_id => $this->make_style(
					$flex_style_id,
					[
						'flex' => [
							'$$type' => 'flex',
							'value'  => [
								'flexGrow' => $this->make_number( $weight ),
							],
						],
					]
				),
			];

			$col_class_values = [ $flex_style_id ];

			if ( null !== $col_style_id ) {
				$col_class_values[] = $col_style_id;
			}
			foreach ( $col_classes as $c ) {
				if ( is_string( $c ) && '' !== $c ) {
					$col_class_values[] = $c;
				}
			}

			$column_nodes[] = [
				'id'       => $col_id,
				'elType'   => 'e-flexbox',
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value'  => $col_class_values,
					],
				],
				'styles'   => $col_styles,
				'elements' => $col_elements,
			];
		}

		$outer_node = [
			'id'       => $outer_id,
			'elType'   => 'e-flexbox',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => $outer_class_values,
				],
			],
			'styles'   => $outer_styles,
			'elements' => $column_nodes,
		];

		return [ 'element' => $outer_node ];
	}

	private function make_style( string $id, array $props ): array {
		return [
			'id'       => $id,
			'type'     => 'class',
			'label'    => $id,
			'variants' => [
				[
					'meta'  => [
						'breakpoint' => 'desktop',
						'state'      => null,
					],
					'props' => $props,
				],
			],
		];
	}

	private function make_string( string $value ): array {
		return [
			'$$type' => 'string',
			'value'  => $value,
		];
	}

	private function make_number( float $value ): array {
		return [
			'$$type' => 'number',
			'value'  => $value,
		];
	}
}

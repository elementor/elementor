<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Global_Classes_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/set-global-classes';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Global Classes (Batch)',
			'description' => 'Creates or updates multiple global CSS classes in one call. Significantly faster than calling elementor/set-global-class in a loop.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'classes' => [
						'type'        => 'array',
						'description' => 'Array of classes to create or update. Each item: { label: string, variants: [...] }. Upsert by label — existing classes are updated, new ones are created.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'label' => [
									'type'        => 'string',
									'description' => 'Human-readable label. Used to find existing class.',
								],
								'variants' => [
									'type'        => 'array',
									'description' => 'Style variants. Each: { meta: { breakpoint, state }, props: { [css-prop]: { $$type, value } }, custom_css: string|null }. custom_css may be a plain string — base64 encoding is handled automatically.',
								],
							],
							'required' => [ 'label', 'variants' ],
						],
					],
				],
				'required'             => [ 'classes' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'results' => [
						'type'        => 'array',
						'description' => 'One entry per input class: { id, label, action }. action is "created" or "updated". id is the FULL UUID string (e.g. "e-gc-9705bfbc-2335-4e75-b761-71e4973977df") — always use the complete string, never truncate.',
					],
					'count' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Batch-creates or updates multiple global CSS classes in a single call.',
						'Use this instead of calling elementor/set-global-class in a loop — much faster.',
						'Upsert by label: existing classes with matching labels are updated; otherwise created.',
						'Returns an id per class. Use these ids in element settings.classes:',
						'  {"$$type":"classes","value":["<id-1>","<id-2>"]}',
						'custom_css in variants may be a plain CSS string — base64 encoding is automatic.',
						'VARIANT META: always include state — use null for default/base state, NOT "normal":',
						'  correct:   {"breakpoint":"desktop","state":null}',
						'  incorrect: {"breakpoint":"desktop","state":"normal"}  ← rejected, produces broken selectors',
						'Valid non-default state values: "hover", "focus", "active".',
						'COMMON PROP TYPES (always use $$type, never $type):',
						'  color:     {"$$type":"color","value":"#rrggbb"}',
						'  size:      {"$$type":"size","value":{"size":16,"unit":"px"}}  — NOT a plain string like "16px"',
						'  string:    {"$$type":"string","value":"Arial, sans-serif"}',
						'  variable:  {"$$type":"global-color-variable","value":"<variable-id>"}',
						'Check style_reference.prop_types from elementor/context for the full list.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		// Build a label → id index for O(1) upsert lookups.
		$label_to_id = [];
		foreach ( $items as $id => $item ) {
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$results = [];

		foreach ( $input['classes'] as $class_input ) {
			$label    = $class_input['label'];
			$variants = $this->normalize_variants( $class_input['variants'] );

			if ( isset( $label_to_id[ $label ] ) ) {
				$class_id                          = $label_to_id[ $label ];
				$items[ $class_id ]['variants']    = $variants;
				$action                            = 'updated';
			} else {
				$class_id           = 'e-gc-' . wp_generate_uuid4();
				$items[ $class_id ] = [
					'id'       => $class_id,
					'label'    => $label,
					'type'     => 'class',
					'variants' => $variants,
				];
				$order[]            = $class_id;
				$label_to_id[ $label ] = $class_id;
				$action             = 'created';
			}

			$results[] = [
				'id'     => $class_id,
				'label'  => $label,
				'action' => $action,
			];
		}

		$repository->put( $items, $order, true );

		return [
			'results' => $results,
			'count'   => count( $results ),
		];
	}

	/**
	 * Normalize variants:
	 * - custom_css: accept plain string or structured ['raw' => '<base64>'] format.
	 * - meta.state: always present as null for default state; reject "normal" (invalid).
	 */
	private function normalize_variants( array $variants ): array {
		foreach ( $variants as &$variant ) {
			if ( isset( $variant['custom_css'] ) && is_string( $variant['custom_css'] ) ) {
				$variant['custom_css'] = [ 'raw' => base64_encode( $variant['custom_css'] ) ]; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
			}

			if ( isset( $variant['meta'] ) && is_array( $variant['meta'] ) ) {
				if ( isset( $variant['meta']['state'] ) && 'normal' === $variant['meta']['state'] ) {
					throw new \InvalidArgumentException( 'Variant meta.state "normal" is not valid — use null for the default/base state. "normal" is not a Style_States value and produces broken CSS selectors.' );
				}

				if ( ! array_key_exists( 'state', $variant['meta'] ) ) {
					$variant['meta']['state'] = null;
				}
			}
		}
		unset( $variant );

		return $variants;
	}
}

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

		$repository->put( $items, $order );

		return [
			'results' => $results,
			'count'   => count( $results ),
		];
	}

	/**
	 * Normalize variants: accept custom_css as a plain string or the structured
	 * ['raw' => '<base64>'] format. Plain strings are base64-encoded automatically.
	 */
	private function normalize_variants( array $variants ): array {
		foreach ( $variants as &$variant ) {
			if ( isset( $variant['custom_css'] ) && is_string( $variant['custom_css'] ) ) {
				$variant['custom_css'] = [ 'raw' => base64_encode( $variant['custom_css'] ) ]; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
			}
		}
		unset( $variant );

		return $variants;
	}
}

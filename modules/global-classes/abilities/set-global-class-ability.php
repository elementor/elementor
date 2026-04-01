<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Global_Class_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/set-global-class';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Global Class',
			'description' => 'Creates or updates a global CSS class in the active Elementor Kit. Looks up by label; creates new if not found.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'label' => [
						'type'        => 'string',
						'description' => 'Human-readable label for the class. Used to find existing class for update.',
					],
					'variants' => [
						'type'        => 'array',
						'description' => 'Array of style variants. Each variant: { meta: { breakpoint, state }, props: { [css-prop]: { $$type, value } }, custom_css: string|null }. custom_css may be a plain CSS string — base64 encoding is handled automatically.',
					],
				],
				'required'             => [ 'label', 'variants' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'     => [
						'type'        => 'string',
						'description' => 'Class ID used in element settings.classes.',
					],
					'action' => [
						'type'        => 'string',
						'description' => '"created" or "updated".',
					],
					'label'  => [ 'type' => 'string' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Creates or updates a global CSS class in the active Elementor Kit.',
						'Pass the label to find an existing class (upsert); if no match, a new class is created.',
						'Variants use the same $$type prop format as v4-styles. Always include at least a desktop variant.',
						'The returned id is the class ID to use in element settings.classes:',
						'  {"$$type":"classes","value":["<returned-id>"]}',
						'After saving, the global class is published immediately (frontend context).',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$label    = $input['label'];
		$variants = $this->normalize_variants( $input['variants'] );

		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		$existing_id = null;
		foreach ( $items as $id => $item ) {
			if ( ( $item['label'] ?? '' ) === $label ) {
				$existing_id = $id;
				break;
			}
		}

		if ( $existing_id ) {
			$items[ $existing_id ]['variants'] = $variants;
			$action   = 'updated';
			$class_id = $existing_id;
		} else {
			$class_id           = 'e-gc-' . wp_generate_uuid4();
			$items[ $class_id ] = [
				'id'       => $class_id,
				'label'    => $label,
				'type'     => 'class',
				'variants' => $variants,
			];
			$order[]  = $class_id;
			$action   = 'created';
		}

		$repository->put( $items, $order );

		return [
			'id'     => $class_id,
			'action' => $action,
			'label'  => $label,
		];
	}

	/**
	 * Accept custom_css as a plain string or the structured ['raw' => '<base64>'] format.
	 * Plain strings are base64-encoded automatically.
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

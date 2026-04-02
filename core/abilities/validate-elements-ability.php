<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Validate_Elements_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/validate-elements';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Validate Elements',
			'description' => 'Validates an elements tree against current global classes and style rules without saving. Returns all errors at once.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'elements' => [
						'type'        => 'array',
						'description' => 'Elementor elements tree to validate.',
					],
				],
				'required'             => [ 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'valid'  => [
						'type'        => 'boolean',
						'description' => 'true when no errors were found.',
					],
					'errors' => [
						'type'        => 'array',
						'description' => 'All validation error messages. Empty when valid:true.',
						'items'       => [ 'type' => 'string' ],
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Validates an elements tree against the current global classes store without saving.',
						'Returns ALL errors at once — use this as a dry-run before set-post-content or build-page.',
						'Runs the full validation pipeline: label resolution → local ID collection → structure checks.',
						'Checks performed: $$type vs $type (single dollar), truncated class IDs, unknown class IDs.',
						'Human-readable class labels in classes.value are resolved the same way as in set-post-content.',
						'valid:true means the tree can be saved without errors. valid:false lists every problem found.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$elements = $input['elements'];

		$repo        = new Global_Classes_Repository();
		$all_classes = $repo->all()->get_items()->all();

		$label_to_id = [];
		$known_ids   = [];
		foreach ( $all_classes as $id => $item ) {
			$known_ids[]                         = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$errors = [];

		try {
			$this->resolve_class_labels( $elements, $label_to_id );
		} catch ( \InvalidArgumentException $e ) {
			$errors[] = $e->getMessage();
		}

		$local_ids = [];
		$this->collect_local_style_ids( $elements, $local_ids );
		$this->validate_elements( $elements, array_merge( $known_ids, $local_ids ), $errors );

		return [
			'valid'  => empty( $errors ),
			'errors' => $errors,
		];
	}
}

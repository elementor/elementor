<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Resolve_Classes_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/resolve-classes';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Resolve Class Labels',
			'description' => 'Resolves human-readable class labels to their full IDs. Useful for rebuilding a page after a session break without re-reading the full global classes payload.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'labels' => [
						'type'        => 'array',
						'description' => 'Array of class labels to resolve (e.g. ["ajax-hero-outer", "ajax-btn-white"]).',
						'items'       => [ 'type' => 'string' ],
					],
				],
				'required'             => [ 'labels' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'resolved' => [
						'type'        => 'object',
						'description' => 'Map of label → full class ID (or null if the label was not found). Example: {"ajax-hero-outer":"e-gc-9705bfbc-2335-4e75-b761-71e4973977df","unknown-label":null}.',
					],
					'count'    => [
						'type'        => 'integer',
						'description' => 'Number of labels that were successfully resolved.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Resolves class labels to their full IDs in a single lightweight call.',
						'Useful after a session break — look up the IDs you need without re-fetching all 80KB of global_classes.',
						'Unknown labels return null in the resolved map (no error thrown).',
						'Full IDs are in the format e-gc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx — always use the complete string.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$repository  = new Global_Classes_Repository();
		$all_items   = $repository->all()->get_items()->all();

		$label_to_id = [];
		foreach ( $all_items as $id => $item ) {
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$resolved = [];
		foreach ( $input['labels'] as $label ) {
			$resolved[ $label ] = $label_to_id[ $label ] ?? null;
		}

		return [
			'resolved' => $resolved,
			'count'    => count( array_filter( $resolved, fn( $id ) => null !== $id ) ),
		];
	}
}

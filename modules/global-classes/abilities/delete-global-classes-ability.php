<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Global_Classes_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/delete-global-classes';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Delete Global Classes (Batch)',
			'description' => 'Removes multiple global CSS classes from the active Elementor Kit in a single call.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'ids' => [
						'type'        => 'array',
						'description' => 'Array of class IDs to delete (e.g. "e-gc-..."). IDs take priority over labels.',
						'items'       => [ 'type' => 'string' ],
					],
					'labels' => [
						'type'        => 'array',
						'description' => 'Array of class labels to delete. Used for any entry not supplied via ids.',
						'items'       => [ 'type' => 'string' ],
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'deleted' => [
						'type'        => 'array',
						'description' => 'Classes that were found and deleted.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'id'    => [ 'type' => 'string' ],
								'label' => [ 'type' => 'string' ],
							],
						],
					],
					'not_found' => [
						'type'        => 'array',
						'description' => 'Identifiers (IDs or labels) that were not found in the Kit.',
						'items'       => [ 'type' => 'string' ],
					],
					'count' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Deletes multiple global classes in one call. Faster than calling elementor/delete-global-class in a loop.',
						'Provide ids (preferred) and/or labels. Supply both to mix lookups in one call.',
						'Partial success is allowed: classes not found are listed in not_found rather than throwing.',
						'Both the frontend and preview stores are updated atomically — editor panel reflects the changes immediately.',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$target_ids    = $input['ids'] ?? [];
		$target_labels = $input['labels'] ?? [];

		if ( empty( $target_ids ) && empty( $target_labels ) ) {
			throw new \InvalidArgumentException( 'At least one of "ids" or "labels" must be provided.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		$label_to_id = [];
		foreach ( $items as $id => $item ) {
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$deleted   = [];
		$not_found = [];
		$ids_to_delete = [];

		foreach ( $target_ids as $target_id ) {
			if ( isset( $items[ $target_id ] ) ) {
				$ids_to_delete[] = $target_id;
				$deleted[]       = [
					'id'    => $target_id,
					'label' => $items[ $target_id ]['label'] ?? $target_id,
				];
			} else {
				$not_found[] = $target_id;
			}
		}

		foreach ( $target_labels as $target_label ) {
			if ( isset( $label_to_id[ $target_label ] ) ) {
				$found_id = $label_to_id[ $target_label ];
				if ( ! in_array( $found_id, $ids_to_delete, true ) ) {
					$ids_to_delete[] = $found_id;
					$deleted[]       = [
						'id'    => $found_id,
						'label' => $target_label,
					];
				}
			} else {
				$not_found[] = $target_label;
			}
		}

		if ( ! empty( $ids_to_delete ) ) {
			$ids_set = array_flip( $ids_to_delete );
			$items   = array_diff_key( $items, $ids_set );
			$order   = array_values( array_filter( $order, fn( $id ) => ! isset( $ids_set[ $id ] ) ) );

			$repository->put( $items, $order, true );
			$repository->context( Global_Classes_Repository::CONTEXT_PREVIEW )->put( $items, $order, true, true );
		}

		return [
			'deleted'   => $deleted,
			'not_found' => $not_found,
			'count'     => count( $deleted ),
		];
	}
}

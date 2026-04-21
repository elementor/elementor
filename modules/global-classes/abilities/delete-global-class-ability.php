<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Global_Class_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/delete-global-class';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Delete Global Class',
			'description' => 'Removes a global CSS class from the active Elementor Kit by ID or label.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'id' => [
						'type'        => 'string',
						'description' => 'Class ID (preferred). Use the id returned by elementor/set-global-class or listed in elementor/global-classes.',
					],
					'label' => [
						'type'        => 'string',
						'description' => 'Class label. Used as fallback when id is not provided.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'      => [
						'type'        => 'string',
						'description' => 'ID of the deleted class.',
					],
					'label'   => [
						'type' => 'string',
					],
					'deleted' => [
						'type' => 'boolean',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Permanently removes a global class from the active Kit.',
						'Provide id (from elementor/global-classes or elementor/set-global-class) for a reliable match.',
						'If only label is provided, the first class with that exact label is removed.',
						'At least one of id or label must be supplied.',
						'After deletion, any elements that reference this class ID will lose the associated styles.',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$target_id    = $input['id'] ?? null;
		$target_label = $input['label'] ?? null;

		if ( ! $target_id && ! $target_label ) {
			throw new \InvalidArgumentException( 'At least one of "id" or "label" must be provided.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		$found_id    = null;
		$found_label = null;

		if ( $target_id && isset( $items[ $target_id ] ) ) {
			$found_id    = $target_id;
			$found_label = $items[ $target_id ]['label'] ?? $target_id;
		} elseif ( $target_label ) {
			foreach ( $items as $id => $item ) {
				if ( ( $item['label'] ?? '' ) === $target_label ) {
					$found_id    = $id;
					$found_label = $target_label;
					break;
				}
			}
		}

		if ( ! $found_id ) {
			$identifier = $target_id ?? $target_label;
			throw new \InvalidArgumentException( "Global class \"$identifier\" not found." ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		unset( $items[ $found_id ] );
		$order = array_values( array_filter( $order, fn( $id ) => $id !== $found_id ) );

		$repository->put( $items, $order, true );

		// Mirror deletion to preview so the editor panel reflects the removed class.
		$repository->context( Global_Classes_Repository::CONTEXT_PREVIEW )->put( $items, $order, true, true );

		return [
			'id'      => $found_id,
			'label'   => $found_label,
			'deleted' => true,
		];
	}
}

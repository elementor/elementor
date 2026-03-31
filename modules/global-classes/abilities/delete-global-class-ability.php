<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Global_Class_Ability {

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/delete-global-class', [
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
					'id'      => [ 'type' => 'string', 'description' => 'ID of the deleted class.' ],
					'label'   => [ 'type' => 'string' ],
					'deleted' => [ 'type' => 'boolean' ],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
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
		] );
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function execute( array $input ): array {
		$target_id    = $input['id'] ?? null;
		$target_label = $input['label'] ?? null;

		if ( ! $target_id && ! $target_label ) {
			throw new \InvalidArgumentException( 'At least one of "id" or "label" must be provided.' );
		}

		$repository = new Global_Classes_Repository();
		$classes    = $repository->all();
		$items      = $classes->get_items()->all();
		$order      = $classes->get_order()->all();

		// Resolve by id first, then fall back to label.
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
			throw new \InvalidArgumentException( "Global class \"$identifier\" not found." );
		}

		unset( $items[ $found_id ] );
		$order = array_values( array_filter( $order, fn( $id ) => $id !== $found_id ) );

		$repository->put( $items, $order );

		return [
			'id'      => $found_id,
			'label'   => $found_label,
			'deleted' => true,
		];
	}
}

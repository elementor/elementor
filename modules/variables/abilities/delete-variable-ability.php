<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Variable_Ability {

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/delete-variable', [
			'label'       => 'Elementor Delete Variable',
			'description' => 'Soft-deletes a global CSS variable from the active Elementor Kit by ID or label.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'id' => [
						'type'        => 'string',
						'description' => 'Variable ID (preferred). Use the id returned by elementor/set-variable or listed in elementor/variables.',
					],
					'label' => [
						'type'        => 'string',
						'description' => 'Variable label. Used as fallback when id is not provided.',
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'        => [ 'type' => 'string', 'description' => 'ID of the deleted variable.' ],
					'label'     => [ 'type' => 'string' ],
					'deleted'   => [ 'type' => 'boolean' ],
					'watermark' => [ 'type' => 'integer' ],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Soft-deletes a global CSS variable from the active Kit.',
						'Provide id (from elementor/variables or elementor/set-variable) for a reliable match.',
						'If only label is provided, the first active variable with that exact label is deleted.',
						'At least one of id or label must be supplied.',
						'Soft-deleted variables are retained internally but stop rendering in CSS.',
						'After deletion, any style props referencing this variable ID will fall back to their raw value.',
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

		$repository = $this->make_repository();
		$collection = $repository->load();

		// Resolve by id first, then fall back to label.
		$found_id    = null;
		$found_label = null;

		if ( $target_id ) {
			try {
				$variable    = $collection->find_or_fail( $target_id );
				$found_id    = $target_id;
				$found_label = $variable->label();
			} catch ( \Exception $e ) {
				// Fall through to label search if id not found.
			}
		}

		if ( ! $found_id && $target_label ) {
			foreach ( $collection->all() as $variable ) {
				if ( ! $variable->is_deleted() && strcasecmp( $variable->label(), $target_label ) === 0 ) {
					$found_id    = $variable->id();
					$found_label = $variable->label();
					break;
				}
			}
		}

		if ( ! $found_id ) {
			$identifier = $target_id ?? $target_label;
			throw new \InvalidArgumentException( "Variable \"$identifier\" not found." );
		}

		$result = $this->make_service()->delete( $found_id );

		return [
			'id'        => $found_id,
			'label'     => $found_label,
			'deleted'   => true,
			'watermark' => $result['watermark'],
		];
	}

	private function make_repository(): Variables_Repository {
		return new Variables_Repository(
			Plugin::$instance->kits_manager->get_active_kit()
		);
	}

	private function make_service(): Variables_Service {
		return new Variables_Service( $this->make_repository(), new Batch_Processor() );
	}
}

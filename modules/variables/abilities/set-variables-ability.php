<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Variables_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/set-variables';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Variables (Batch)',
			'description' => 'Creates or updates multiple global CSS variables in one call. Significantly faster than calling elementor/set-variable in a loop.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'variables' => [
						'type'        => 'array',
						'description' => 'Array of variables to create or update. Each item: { label, type?, value }. Upsert by label.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'label' => [
									'type'        => 'string',
									'description' => 'Variable label (no spaces, max 50 chars). Used to find existing variable.',
								],
								'type' => [
									'type'        => 'string',
									'enum'        => [ 'color', 'font', 'size' ],
									'description' => 'Variable type. Required only when creating a new variable.',
								],
								'value' => [
									'description' => 'Variable value. color: "#rrggbb". font: family string. size: {"size":16,"unit":"px"}.',
								],
							],
							'required' => [ 'label', 'value' ],
						],
					],
				],
				'required'             => [ 'variables' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'results' => [
						'type'        => 'array',
						'description' => 'One entry per input variable: { id, label, type, action }.',
					],
					'count'     => [ 'type' => 'integer' ],
					'watermark' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Batch-creates or updates multiple global CSS variables in a single call.',
						'Use this instead of calling elementor/set-variable in a loop — much faster.',
						'Upsert by label (case-insensitive): existing variables are updated; otherwise created.',
						'Returned ids are usable in style props:',
						'  color: {"$$type":"global-color-variable","value":"<id>"}',
						'  font:  {"$$type":"global-font-variable","value":"<id>"}',
						'  size:  {"$$type":"global-size-variable","value":"<id>"}',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$repository = $this->make_repository();
		$collection = $repository->load();

		// Build a label → variable index for O(1) upsert lookups.
		$label_to_var = [];
		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$label_to_var[ strtolower( $variable->label() ) ] = $variable;
			}
		}

		$results = [];

		foreach ( $input['variables'] as $var_input ) {
			$label       = $var_input['label'];
			$value       = $var_input['value'];
			$type        = $var_input['type'] ?? null;
			$label_lower = strtolower( $label );

			if ( isset( $label_to_var[ $label_lower ] ) ) {
				$variable = $label_to_var[ $label_lower ];
				$variable->apply_changes( [ 'value' => $value ] );
				$action = 'updated';
				$id     = $variable->id();
			} else {
				if ( ! $type ) {
					// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
					throw new \InvalidArgumentException( "Variable \"$label\": \"type\" is required when creating a new variable." );
				}

				$collection->assert_limit_not_reached();
				$collection->assert_label_is_unique( $label );

				$id   = $collection->next_id();
				$data = [
					'id'    => $id,
					'label' => $label,
					'type'  => $type,
					'value' => $value,
					'order' => $collection->get_next_order(),
				];

				$variable = Variable::from_array( $data );
				$variable->validate();
				$collection->add_variable( $variable );

				// Keep label index current for subsequent iterations in this batch.
				$label_to_var[ $label_lower ] = $variable;
				$action = 'created';
			}

			$results[] = [
				'id'     => $id,
				'label'  => $label,
				'type'   => $variable->type(),
				'action' => $action,
			];
		}

		$watermark = $repository->save( $collection );

		if ( false === $watermark ) {
			throw new \RuntimeException( 'Failed to save variables batch.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return [
			'results'   => $results,
			'count'     => count( $results ),
			'watermark' => $watermark,
		];
	}

	private function make_repository(): Variables_Repository {
		return new Variables_Repository(
			Plugin::$instance->kits_manager->get_active_kit()
		);
	}
}

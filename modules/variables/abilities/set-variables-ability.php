<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Core\Files\CSS\Post as Post_CSS;
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
						'The "type" field accepts shorthand values: "color", "font", or "size". These are mapped to full storage keys automatically.',
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
			$value       = $this->normalize_size_value( $var_input['value'], $var_input['type'] ?? null );
			$type        = $var_input['type'] ?? null;
			$label_lower = strtolower( $label );

			if ( isset( $label_to_var[ $label_lower ] ) ) {
				$variable = $label_to_var[ $label_lower ];

				// Fix legacy shorthand type stored by earlier ability versions.
				$corrected_type = $this->map_type( $variable->type() );
				if ( $corrected_type !== $variable->type() ) {
					$variable->set_type( $corrected_type );
				}

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
					'type'  => $this->map_type( $type ),
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

		// Regenerate the kit's CSS file so CSS variable references (e.g. var(--e-gv-...))
		// resolve immediately without a manual cache flush. Variables are stored in the kit
		// post meta and compiled into the kit's Post CSS file.
		$kit_id = Plugin::$instance->kits_manager->get_active_kit()->get_id();
		if ( $kit_id ) {
			Post_CSS::create( $kit_id )->update();
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

	/**
	 * Normalize size variable values.
	 *
	 * Prop_Type_Adapter::to_storage() calls parse_size_value() which expects a string
	 * (e.g. "72px"). When the caller passes an array {"size":72,"unit":"px"}, the adapter
	 * sees is_array($value) and bails early, storing the raw array without the V2 $$type
	 * wrapper. from_storage() then reads $value['value'] which is null, producing "px"
	 * (no number) in the rendered CSS.
	 *
	 * Fix: convert array inputs for size variables to the canonical "NUunit" string so
	 * parse_size_value() can correctly produce the V2-wrapped value.
	 *
	 * Non-size types and already-string values are returned unchanged.
	 *
	 * @param mixed       $value Raw input value.
	 * @param string|null $type  Raw input type (shorthand or full key).
	 * @return mixed Normalized value.
	 */
	private function normalize_size_value( $value, ?string $type ) {
		$resolved_type = $type ? $this->map_type( $type ) : null;

		if ( 'global-size-variable' !== $resolved_type ) {
			return $value;
		}

		if ( ! is_array( $value ) || ! isset( $value['size'], $value['unit'] ) ) {
			return $value;
		}

		// "auto" unit has no numeric component.
		if ( 'auto' === strtolower( $value['unit'] ) ) {
			return 'auto';
		}

		return $value['size'] . $value['unit'];
	}

	/**
	 * Map shorthand type inputs to the full storage keys expected by Prop_Type_Adapter.
	 * Accepts "color", "font", or "size" and returns the full key.
	 * Already-correct keys (e.g. "global-color-variable") are passed through unchanged.
	 */
	private function map_type( string $type ): string {
		$type_map = [
			'color' => 'global-color-variable',
			'font'  => 'global-font-variable',
			'size'  => 'global-size-variable',
		];

		return $type_map[ $type ] ?? $type;
	}
}

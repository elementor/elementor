<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Variable_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/set-variable';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Variable',
			'description' => 'Creates or updates a global CSS variable (color, font, size) in the active Elementor Kit. Looks up by label; creates new if not found.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'label' => [
						'type'        => 'string',
						'description' => 'Variable label (no spaces, max 50 chars). Used to find existing variable for update.',
					],
					'type' => [
						'type'        => 'string',
						'enum'        => [ 'color', 'font', 'size' ],
						'description' => 'Variable type. Required when creating a new variable.',
					],
					'value' => [
						'description' => 'Variable value. For color: "#rrggbb" or "rgba(...)". For font: font family string. For size: {"size": 16, "unit": "px"}.',
					],
				],
				'required'             => [ 'label', 'value' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'        => [
						'type'        => 'string',
						'description' => 'Variable ID usable in $$type prop references.',
					],
					'action'    => [
						'type'        => 'string',
						'description' => '"created" or "updated".',
					],
					'label'     => [ 'type' => 'string' ],
					'type'      => [ 'type' => 'string' ],
					'watermark' => [ 'type' => 'integer' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Creates or updates a global CSS variable in the active Elementor Kit.',
						'Pass label to find an existing variable (upsert by label); if no match, a new variable is created.',
						'The returned id can be referenced in style props:',
						'  color:  {"$$type":"global-color-variable","value":"<id>"}',
						'  font:   {"$$type":"global-font-variable","value":"<id>"}',
						'  size:   {"$$type":"global-size-variable","value":"<id>"}',
						'Label constraints: no spaces, max 50 characters.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$label = $input['label'];
		$value = $input['value'];
		$type  = $input['type'] ?? null;

		$service    = $this->make_service();
		$collection = $this->make_repository()->load();

		$existing = null;
		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() && strcasecmp( $variable->label(), $label ) === 0 ) {
				$existing = $variable;
				break;
			}
		}

		if ( $existing ) {
			$result = $service->update( $existing->id(), [ 'value' => $value ] );
			$action = 'updated';
			$id     = $existing->id();
		} else {
			if ( ! $type ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
				throw new \InvalidArgumentException( 'Parameter "type" is required when creating a new variable.' );
			}

			$result = $service->create( [
				'label' => $label,
				'type'  => $type,
				'value' => $value,
			] );
			$action = 'created';
			$id     = $result['variable']['id'];
		}

		return [
			'id'        => $id,
			'action'    => $action,
			'label'     => $label,
			'type'      => $existing ? $existing->type() : $type,
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

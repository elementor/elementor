<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Globals_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-globals';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Globals', 'elementor' ),
			__( 'Returns site-wide Elementor design data: global classes (shared CSS classes from the kit) and variables (design tokens such as colors and fonts tied to the active kit). Use when you need kit-level styling context, not a single page tree.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'global_classes' => [
						'type' => 'object',
						'description' => 'Global class definitions and order from the active kit.',
					],
					'variables' => [
						'type' => 'object',
						'description' => 'Variables list, total count, and watermark from the active kit.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			}
			// No input_schema — this ability takes no input.
		);
	}

	public function execute( $input = [] ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$classes_payload = Global_Classes_Repository::make( $kit )->all()->get();

		$variables_service = new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);

		$variables_payload = $variables_service->load();

		return [
			'global_classes' => $classes_payload,
			'variables' => [
				'variables' => $variables_payload['data'] ?? [],
				'total' => isset( $variables_payload['data'] ) ? count( $variables_payload['data'] ) : 0,
				'watermark' => $variables_payload['watermark'] ?? null,
			],
		];
	}
}

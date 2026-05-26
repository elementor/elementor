<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Services\Global_Classes_Read_Payload;
use Elementor\Modules\Variables\Services\Variables_Read_Payload;
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
			__( 'Returns site-wide Elementor design data: global classes (shared CSS classes from the kit) and variables (design tokens such as colors and fonts tied to the active kit). Each sub-object follows the canonical read shape used by the planned `elementor/list-global-classes` and `elementor/list-variables` abilities, so consumers can treat them symmetrically.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'global_classes' => [
						'type' => 'object',
						'description' => 'Global class definitions from the active kit. Shape: { items, order, total, watermark, supported_breakpoints, supported_states }. `watermark` is always null for global classes (the repository has no per-collection counter).',
					],
					'variables' => [
						'type' => 'object',
						'description' => 'Variables (color, font, size) from the active kit. Shape: { items, total, watermark, supported_types }. `items` is the ID-keyed bag (renamed from the internal `data` field); `supported_types` is Pro-filtered.',
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
		);
	}

	public function execute( $input = [] ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return [
			'global_classes' => Global_Classes_Read_Payload::build( $kit ),
			'variables' => Variables_Read_Payload::build( $kit ),
		];
	}
}

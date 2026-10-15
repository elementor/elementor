<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Experiments_Catalog;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Experiments_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-experiments';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Experiments', 'elementor' ),
			Prompt_Loader::load( 'list-experiments' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'atomic_editor' => Experiments_Catalog::atomic_editor_schema(),
					'experiments' => [
						'type' => 'array',
						'items' => Experiments_Catalog::experiment_schema(),
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
			fn() => current_user_can( 'manage_options' )
		);
	}

	public function execute( $input = [] ) {
		return [
			'atomic_editor' => Experiments_Catalog::atomic_editor_status(),
			'experiments' => Experiments_Catalog::get_toggleable(),
		];
	}
}

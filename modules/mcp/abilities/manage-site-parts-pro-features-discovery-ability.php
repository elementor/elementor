<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Site_Parts_Pro_Features_Discovery_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/manage-site-parts';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Site Parts', 'elementor' ),
			Prompt_Loader::load( 'manage-site-parts' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'edit_posts' ),
			Site_Parts_Schema::manage_input()
		);
	}

	public function execute( $input = [] ) {
		$operations = is_array( $input ) && is_array( $input['operations'] ?? null ) ? $input['operations'] : [];

		return Site_Parts_Pro_Features_Discovery::for_manage( $operations );
	}
}

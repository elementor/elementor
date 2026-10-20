<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Pro_Upsell;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Site_Parts_Upsell_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-site-parts';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Site Parts', 'elementor' ),
			Prompt_Loader::load( 'list-site-parts' ),
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
			Site_Parts_Schema::list_input()
		);
	}

	public function is_available() {
		return Site_Parts_Pro_Upsell::for_list();
	}

	public function execute( $input = [] ) {
		return Site_Parts_Pro_Upsell::for_list();
	}
}

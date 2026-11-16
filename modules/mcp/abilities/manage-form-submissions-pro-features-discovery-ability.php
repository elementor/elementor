<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Form_Submissions_Schema;
use Elementor\Modules\Mcp\Abilities\Utils\Forms_Pro_Features_Discovery;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Form_Submissions_Pro_Features_Discovery_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/manage-form-submissions';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Form Submissions', 'elementor' ),
			Prompt_Loader::load( 'manage-form-submissions-pro-features-discovery' ),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'status', 'results' ],
				'properties' => [
					'status' => [ 'type' => 'string' ],
					'results' => [ 'type' => 'array' ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'manage_options' ),
			Form_Submissions_Schema::manage_input()
		);
	}

	public function execute( $input = [] ) {
		return Forms_Pro_Features_Discovery::for_submissions();
	}
}

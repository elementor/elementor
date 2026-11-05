<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Form_Submissions_Schema;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Form_Submissions_Pro_Features_Discovery_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-form-submissions';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Form Submissions', 'elementor' ),
			Prompt_Loader::load( 'list-form-submissions-pro-features-discovery' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'submissions' => [ 'type' => 'array' ],
					'pagination' => [ 'type' => 'object' ],
					'counts' => [ 'type' => 'object' ],
					'forms' => [ 'type' => 'array' ],
					'llm_instructions' => [ 'type' => 'string' ],
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
			Form_Submissions_Schema::list_input()
		);
	}

	public function execute( $input = [] ) {
		return [ 'submissions' => [] ];
	}
}

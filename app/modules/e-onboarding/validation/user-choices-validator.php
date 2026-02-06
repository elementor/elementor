<?php

namespace Elementor\App\Modules\E_Onboarding\Validation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices_Validator extends Base_Validator {

	protected function get_rules(): array {
		return [
			// Step 1: Who are you building for? (single selection)
			'building_for' => [
				'type' => 'string',
				'nullable' => true,
			],

			// Step 2: What is your site about? (multiple selection)
			'site_about' => [
				'type' => 'string_array',
			],

			// Step 3: Experience level (single selection)
			'experience_level' => [
				'type' => 'string',
				'nullable' => true,
			],

			// Step 4: Theme selection (single selection)
			'theme_selection' => [
				'type' => 'string',
				'nullable' => true,
			],

			// Step 5: Site features (multiple selection)
			'site_features' => [
				'type' => 'string_array',
			],
		];
	}
}

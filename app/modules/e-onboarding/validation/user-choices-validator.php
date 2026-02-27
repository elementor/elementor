<?php

namespace Elementor\App\Modules\E_Onboarding\Validation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices_Validator extends Base_Validator {

	protected function get_rules(): array {
		return [
			'building_for' => [
				'type' => 'string',
				'nullable' => true,
			],

			'site_about' => [
				'type' => 'string_array',
			],

			'experience_level' => [
				'type' => 'string',
				'nullable' => true,
			],

			'theme_selection' => [
				'type' => 'string',
				'nullable' => true,
			],

			'site_features' => [
				'type' => 'string_array',
			],
		];
	}
}

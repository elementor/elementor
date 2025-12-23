<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Equals_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'equals';
	}

	public function evaluate( $value, array $condition_config ): bool {
		$expected = $this->get_expected_value( $condition_config );

		return $value === $expected;
	}
}

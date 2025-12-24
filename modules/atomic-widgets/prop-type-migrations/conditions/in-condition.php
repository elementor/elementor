<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class In_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'in';
	}

	public function evaluate( $value, array $condition_config ): bool {
		$expected = $this->get_expected_value( $condition_config );

		if ( ! is_array( $expected ) ) {
			return false;
		}

		return in_array( $value, $expected, true );
	}
}

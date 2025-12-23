<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Not_In_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'not_in';
	}

	public function evaluate( $value, array $condition_config ): bool {
		$expected = $this->get_expected_value( $condition_config );

		if ( ! is_array( $expected ) ) {
			return true;
		}

		return ! in_array( $value, $expected, true );
	}
}

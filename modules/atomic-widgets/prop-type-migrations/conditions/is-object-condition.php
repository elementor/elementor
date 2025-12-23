<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Is_Object_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'is_object';
	}

	public function evaluate( $value, array $condition_config ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( empty( $value ) ) {
			return true;
		}

		return ! array_is_list( $value );
	}
}

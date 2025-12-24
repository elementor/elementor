<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Is_Primitive_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'is_primitive';
	}

	public function evaluate( $value, array $condition_config ): bool {
		return is_scalar( $value ) || null === $value;
	}
}

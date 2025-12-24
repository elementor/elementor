<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Exists_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'exists';
	}

	public function evaluate( $value, array $condition_config ): bool {
		return null !== $value;
	}
}

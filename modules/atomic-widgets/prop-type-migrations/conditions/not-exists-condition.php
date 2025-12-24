<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Not_Exists_Condition extends Condition_Base {
	public static function get_name(): string {
		return 'not_exists';
	}

	public function evaluate( $value, array $condition_config ): bool {
		return null === $value;
	}
}

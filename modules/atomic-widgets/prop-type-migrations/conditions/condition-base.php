<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Conditions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts\Condition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Condition_Base implements Condition {
	abstract public static function get_name(): string;

	abstract public function evaluate( $value, array $condition_config ): bool;

	protected function get_expected_value( array $condition_config ) {
		return $condition_config['value'] ?? null;
	}
}

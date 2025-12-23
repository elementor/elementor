<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Condition {
	public static function get_name(): string;

	public function evaluate( $value, array $condition_config ): bool;
}

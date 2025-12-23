<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Operation {
	public static function get_name(): string;

	public function execute( array &$data, string $resolved_path, array $op_config, Migration_Context $context ): void;
}

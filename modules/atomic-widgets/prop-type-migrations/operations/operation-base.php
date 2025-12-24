<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Contracts\Operation;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Value_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Operation_Base implements Operation {
	abstract public static function get_name(): string;

	abstract public function execute( array &$data, string $resolved_path, array $op_config, Migration_Context $context ): void;

	protected function resolve_value( $value_definition, $current_value ) {
		if ( ! Value_Resolver::is_reference( $value_definition ) ) {
			return $value_definition;
		}

		return Value_Resolver::make( $current_value )->resolve( $value_definition );
	}
}

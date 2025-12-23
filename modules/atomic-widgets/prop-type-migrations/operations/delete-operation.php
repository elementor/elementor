<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Operation extends Operation_Base {
	public static function get_name(): string {
		return 'delete';
	}

	public function execute( array &$data, string $resolved_path, array $op_config, Migration_Context $context ): void {
		$path_resolver = Path_Resolver::make( $data );

		$path_resolver->delete( $resolved_path );

		$data = $path_resolver->get_data();
	}
}

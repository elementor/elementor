<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Path_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Operation extends Operation_Base {
	public static function get_name(): string {
		return 'set';
	}

	public function execute( array &$data, string $resolved_path, array $op_config, Migration_Context $context ): void {
		$path_resolver = Path_Resolver::make( $data );

		$has_value = array_key_exists( 'value', $op_config );
		$has_key = array_key_exists( 'key', $op_config );

		if ( $has_key ) {
			$new_key = $op_config['key'];
			$path_resolver->rename_key( $resolved_path, $new_key );
			$data = $path_resolver->get_data();

			$path_resolver = Path_Resolver::make( $data );
			$resolved_path = $this->get_renamed_path( $resolved_path, $new_key );
		}

		if ( $has_value ) {
			$current_value = $path_resolver->get( $resolved_path );
			$new_value = $this->resolve_value( $op_config['value'], $current_value );

			$path_resolver->set( $resolved_path, $new_value );
			$data = $path_resolver->get_data();
		}
	}

	private function get_renamed_path( string $path, string $new_key ): string {
		$last_dot = strrpos( $path, '.' );
		$last_bracket = strrpos( $path, '[' );

		if ( false === $last_dot && false === $last_bracket ) {
			return $new_key;
		}

		$last_separator = max(
			false === $last_dot ? -1 : $last_dot,
			false === $last_bracket ? -1 : $last_bracket
		);

		if ( $last_separator === $last_bracket ) {
			$close_bracket = strpos( $path, ']', $last_bracket );

			return substr( $path, 0, $last_bracket + 1 ) . $new_key . substr( $path, $close_bracket );
		}

		return substr( $path, 0, $last_dot + 1 ) . $new_key;
	}
}

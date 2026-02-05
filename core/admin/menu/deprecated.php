<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Deprecated {

	private $deprecation_notice = 'Elementor menu items are now registered inside Elementor\Core\Admin\EditorOneMenu. Use the \'elementor/editor-one/menu/register\' hook instead.';

	private function trigger_deprecation_notice( $function_name, $version ) {
		if ( ! $this->get_external_caller_info() ) {
			return;
		}

		$replacement = $this->deprecation_notice;
		$replacement .= sprintf( ' Called from: %s:%d', $external_caller_info['file'], $external_caller_info['line'] );

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( $function_name, $version, $replacement );
	}

	private function trigger_deprecated_action( $hook, $args, $version ) {
		if ( ! has_action( $hook ) ) {
			return;
		}

		if ( ! $this->get_external_caller_info() ) {
			do_action_ref_array( $hook, $args );
			return;
		}

		$replacement = $this->deprecation_notice;
		$replacement .= sprintf( ' Hook registered in: %s:%d', $external_caller_info['file'], $external_caller_info['line'] );

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( $hook, $args, $version, $replacement );
	}

	private function get_external_caller_info() {
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 15 );
		$elementor_path = defined( 'ELEMENTOR_PATH' ) ? rtrim( ELEMENTOR_PATH, '/' ) : '';
		$wp_content_path = defined( 'WP_CONTENT_DIR' ) ? rtrim( WP_CONTENT_DIR, '/' ) : '';

		foreach ( $backtrace as $index => $trace ) {
			if ( ! isset( $trace['file'] ) || ! isset( $trace['line'] ) ) {
				continue;
			}

			$file = $trace['file'];
			$line = $trace['line'];

			$is_test_file = strpos( $file, '/tests/phpunit/' ) !== false;

			$is_elementor_internal = $elementor_path && strpos( $file, $elementor_path ) === 0 && ! $is_test_file;

			$is_wp_core = strpos( $file, 'wp-includes' ) !== false ||
						  strpos( $file, 'wp-admin' ) !== false;

			$is_wp_content = $wp_content_path && strpos( $file, $wp_content_path ) === 0;

			if ( ! $is_elementor_internal && ! $is_wp_core && $is_wp_content ) {
				return [
					'file' => $this->normalize_file_path( $file ),
					'line' => $line,
				];
			}
		}

		return null;
	}

	private function normalize_file_path( $file_path ) {
		$wp_content_path = rtrim( WP_CONTENT_DIR, '/' );

		if ( strpos( $file_path, $wp_content_path ) === 0 ) {
			return 'wp-content' . substr( $file_path, strlen( $wp_content_path ) );
		}

		return basename( $file_path );
	}
}

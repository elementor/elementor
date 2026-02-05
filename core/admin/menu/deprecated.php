<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Deprecated {

	private $deprecation_notice = 'Elementor menu items are now registered inside Elementor\Core\Admin\EditorOneMenu. Use the \'elementor/editor-one/menu/register\' hook instead.';

	private function trigger_deprecation_notice( $function_name, $version, $internal = false ) {
		if ( $internal ) {
			return;
		}

		$caller_info = $this->get_caller_info();
		$replacement = $this->deprecation_notice;

		if ( $caller_info ) {
			$replacement .= sprintf( ' Called from: %s:%d', $caller_info['file'], $caller_info['line'] );
		}

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->deprecated_function( $function_name, $version, $replacement );
	}

	private function trigger_deprecated_action( $hook, $args, $version, $internal = false ) {
		if ( ! has_action( $hook ) ) {
			return;
		}

		if ( $internal ) {
			do_action_ref_array( $hook, $args );
			return;
		}

		$caller_info = $this->get_caller_info();
		$replacement = $this->deprecation_notice;

		if ( $caller_info ) {
			$replacement .= sprintf( ' Hook registered in: %s:%d', $caller_info['file'], $caller_info['line'] );
		}

		Plugin::$instance->modules_manager
			->get_modules( 'dev-tools' )
			->deprecation
			->do_deprecated_action( $hook, $args, $version, $replacement );
	}

	private function get_caller_info() {
		$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 15 );

		foreach ( $backtrace as $trace ) {
			if ( ! isset( $trace['file'] ) || ! isset( $trace['line'] ) ) {
				continue;
			}

			$file = $trace['file'];

			return [
				'file' => $this->normalize_file_path( $file ),
				'line' => $trace['line'],
			];
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

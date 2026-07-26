<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function get_name() {
		return 'agents';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_txt' ], 1 );
	}

	public function maybe_serve_llms_txt() {
		if ( ! $this->is_llms_txt_request() ) {
			return;
		}

		$llms = $this->get_llms_txt_content();

		if ( '' === $llms ) {
			return;
		}

		Utils::do_not_cache();
		status_header( 200 );
		header( 'Content-Type: text/plain; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		Utils::print_unescaped_internal_string( $llms );
		exit;
	}

	public function get_llms_txt_content(): string {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$agents = $kit->get_settings( 'agents' );

		if ( ! is_array( $agents ) || ! isset( $agents['llms'] ) ) {
			return '';
		}

		$llms = $agents['llms'];

		return is_string( $llms ) ? $llms : '';
	}

	private function is_llms_txt_request(): bool {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return false;
		}

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );

			if ( 0 === strpos( $path, $home_path ) ) {
				$path = substr( $path, strlen( $home_path ) );
			}
		}

		$path = untrailingslashit( $path );

		return '/llms.txt' === $path || 'llms.txt' === ltrim( $path, '/' );
	}
}

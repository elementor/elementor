<?php

namespace Elementor\Modules\Agents\Components\Readability;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Classes\Request_Path;
use Elementor\Modules\Agents\Module;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Not_Found extends Feature_Component {

	const STATUS_NOT_FOUND = 404;

	const AFTER_CANONICAL_REDIRECT_PRIORITY = 11;

	const MARKDOWN_PATH_SUFFIX = '.md';

	private Agent_Ready_Settings $settings;

	private Markdown_Endpoint $markdown_endpoint;

	private Module $module;

	public function __construct( Agent_Ready_Settings $settings, Markdown_Endpoint $markdown_endpoint, Module $module ) {
		$this->settings          = $settings;
		$this->markdown_endpoint = $markdown_endpoint;
		$this->module            = $module;
	}

	public function get_id(): string {
		return 'markdown_not_found';
	}

	public function get_layer(): string {
		return 'readability';
	}

	public function get_required_modules(): array {
		return [
			Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT,
		];
	}

	public function register(): void {
		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT ) ) {
			add_action( 'template_redirect', [ $this, 'on_template_redirect' ], self::AFTER_CANONICAL_REDIRECT_PRIORITY );
		}
	}

	public function on_template_redirect(): void {
		if ( $this->should_serve_not_found() ) {
			$this->serve_not_found();
		}
	}

	public function should_serve_not_found(): bool {
		return is_404() && $this->is_markdown_requested();
	}

	public function build_markdown(): string {
		$lines = [
			'# 404 Not Found',
			'',
			'The page you requested does not exist on this site.',
			'',
			'## Where to go next',
			'',
			'- [Home](' . esc_url_raw( home_url( '/' ) ) . ')',
		];

		$sitemap_url = get_sitemap_url( 'index' );

		if ( $sitemap_url ) {
			$lines[] = '- [Sitemap](' . esc_url_raw( $sitemap_url ) . ')';
		}

		if ( $this->module->should_advertise_llms_txt() ) {
			$lines[] = '- [llms.txt](' . esc_url_raw( home_url( '/' . Module::LLMS_FILENAME ) ) . ')';
		}

		return implode( "\n", $lines ) . "\n";
	}

	/**
	 * @return array<string, string>
	 */
	public function build_response_headers(): array {
		return $this->markdown_endpoint->build_base_markdown_headers();
	}

	private function is_markdown_requested(): bool {
		return $this->markdown_endpoint->is_markdown_request()
			|| str_ends_with( Request_Path::get_relative_path(), self::MARKDOWN_PATH_SUFFIX );
	}

	private function serve_not_found(): void {
		status_header( self::STATUS_NOT_FOUND );
		nocache_headers();

		if ( ! headers_sent() ) {
			foreach ( $this->build_response_headers() as $name => $value ) {
				header( $name . ': ' . $value );
			}
		}

		Utils::print_unescaped_internal_string( $this->build_markdown() );
		exit;
	}
}

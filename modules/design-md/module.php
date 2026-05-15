<?php
namespace Elementor\Modules\DesignMd;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const QUERY_VAR = 'elementor_design_md';
	const ROUTER_OPTION_KEY = 'elementor_design_md_router_version';

	public function get_name() {
		return 'design-md';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'init', [ $this, 'register_rewrite_rule' ] );
		add_filter( 'query_vars', [ $this, 'add_query_var' ] );
		add_action( 'template_redirect', [ $this, 'maybe_serve_design_md' ], 0 );
	}

	public function register_rewrite_rule() {
		add_rewrite_rule( '^design\.md/?$', 'index.php?' . self::QUERY_VAR . '=1', 'top' );

		$this->maybe_flush_rewrite_rules();
	}

	public function add_query_var( array $vars ): array {
		$vars[] = self::QUERY_VAR;

		return $vars;
	}

	public function maybe_serve_design_md() {
		if ( ! $this->is_design_md_request() ) {
			return;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit_for_frontend();

		$renderer = new Design_Md_Renderer();
		$output = $renderer->render( $kit );

		$output = apply_filters( 'elementor/design_md/output', $output, $kit );

		nocache_headers();
		status_header( 200 );
		header( 'Content-Type: text/markdown; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		echo $output; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	private function is_design_md_request(): bool {
		if ( get_query_var( self::QUERY_VAR ) ) {
			return true;
		}

		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		$request_path = untrailingslashit( (string) wp_parse_url( $request_uri, PHP_URL_PATH ) );
		$expected_path = untrailingslashit( (string) wp_parse_url( home_url( '/design.md' ), PHP_URL_PATH ) );

		return '' !== $expected_path && $request_path === $expected_path;
	}

	private function maybe_flush_rewrite_rules(): void {
		if ( get_option( self::ROUTER_OPTION_KEY ) !== ELEMENTOR_VERSION ) {
			flush_rewrite_rules();
			update_option( self::ROUTER_OPTION_KEY, ELEMENTOR_VERSION );
		}
	}
}

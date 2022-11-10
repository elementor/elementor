<?php
namespace Elementor\Modules\WebCli;

use Elementor\Core\Base\App;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends App {

	public function get_name() {
		return 'web-cli';
	}

	public function __construct() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'elementor/frontend/after_register_scripts', [ $this, 'register_scripts' ] );
	}

	public function register_scripts() {
		wp_register_script(
			'elementor-web-cli',
			$this->get_js_assets_url( 'web-cli' ),
			[
				'jquery',
			],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config( 'elementor-web-cli' );
	}

	protected function get_init_settings() {
		return [
			'isDebug' => ( defined( 'WP_DEBUG' ) && WP_DEBUG ),
			'urls' => [
				'rest' => $this->get_rest_url(),
				'assets' => ELEMENTOR_ASSETS_URL,
			],
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'version' => ELEMENTOR_VERSION,
		];
	}

	/**
	 * Force the REST URL to be in non-permalink structure (e.g. `/index.php?rest_route=/`
	 * instead of `/wp-json/`) in order to make sure that servers that don't support
	 * URL rewrites or have a corrupted .htaccess will still work.
	 *
	 * @return string
	 */
	protected function get_rest_url() {
		$filter = function() {
			return null;
		};

		add_filter( 'option_permalink_structure', $filter );

		$rest_url = get_rest_url();

		remove_filter( 'option_permalink_structure', $filter );

		return $rest_url;
	}
}

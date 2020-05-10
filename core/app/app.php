<?php
namespace Elementor\Core\App;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class App extends BaseApp {

	const PAGE_ID = 'elementor-app';

	/**
	 * Get module name.
	 *
	 * Retrieve the module name.
	 *
	 * @since 3.0.0
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name() {
		return 'app';
	}

	public function get_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID . '&nonce=' . wp_create_nonce( self::PAGE_ID ) );
	}

	public function register_admin_menu() {
		global $submenu;

		add_submenu_page(
			Settings::PAGE_ID,
			__( 'Site Editor', 'elementor' ),
			__( 'Site Editor', 'elementor' ),
			'manage_options',
			self::PAGE_ID
		);

		// Hack to add a link to sub menu.
		$submenu['elementor'][1][2] = $this->get_url(); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}

	private function render() {
		require __DIR__ . '/view.php';
	}

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 20 );

		if ( empty( $_GET['nonce'] ) || ! wp_verify_nonce( $_GET['nonce'], self::PAGE_ID ) ) {
			return;
		}
		if ( empty( $_GET['page'] ) || self::PAGE_ID !== $_GET['page'] ) {
			return;
		}

		// Send MIME Type header like WP admin-header.
		header( 'Content-Type: ' . get_option( 'html_type' ) . '; charset=' . get_option( 'blog_charset' ) );

		// Setup default heartbeat options
		// TODO: Enable heartbeat.
		add_filter( 'heartbeat_settings', function( $settings ) {
			$settings['interval'] = 15;
			return $settings;
		} );

		// Tell to WP Cache plugins do not cache this request.
		Utils::do_not_cache();

		do_action( 'elementor/app/init' );

		$this->render();

		die;
	}
}

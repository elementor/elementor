<?php
namespace Elementor\Core\App;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\TemplateLibrary\Source_Local;
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

	public function get_base_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID . '&ver=' . ELEMENTOR_VERSION );
	}

	public function register_admin_menu() {
		add_submenu_page(
			Source_Local::ADMIN_MENU_SLUG,
			__( 'Site Editor', 'elementor' ),
			__( 'Site Editor', 'elementor' ),
			'manage_options',
			self::PAGE_ID
		);
	}

	public function fix_submenu( $menu ) {
		global $submenu;

		// Hack to add a link to sub menu.
		foreach ( $submenu[ Source_Local::ADMIN_MENU_SLUG ] as &$item ) {
			if ( self::PAGE_ID === $item[2] ) {
				$item[2] = $this->get_settings( 'menu_url' ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
				$item[4] = 'elementor-app-link'; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
			}
		}

		return $menu;
	}

	public function is_current() {
		return ( ! empty( $_GET['page'] ) && self::PAGE_ID === $_GET['page'] );
	}

	public function admin_init() {
		do_action( 'elementor/app/init', $this );

		$this->enqueue_assets();

		// Setup default heartbeat options
		// TODO: Enable heartbeat.
		add_filter( 'heartbeat_settings', function( $settings ) {
			$settings['interval'] = 15;
			return $settings;
		} );

		$this->render();
		die;
	}

	protected function get_init_settings() {
		return [
			'menu_url'  => $this->get_base_url() . '#site-editor/promotion',
			'assets_url'  => ELEMENTOR_ASSETS_URL,
			'return_url'  => isset( $_SERVER['HTTP_REFERER'] ) ? $_SERVER['HTTP_REFERER'] : admin_url(),
		];
	}

	private function render() {
		require __DIR__ . '/view.php';
	}

	private function enqueue_assets() {
		if ( empty( $_GET['mode'] ) || 'iframe' !== $_GET['mode'] ) {
			Plugin::$instance->init_common();
			Plugin::$instance->common->register_scripts();
		}

		$direction_suffix = is_rtl() ? '-rtl' : '';

		wp_register_style(
			'elementor-icons',
			$this->get_css_assets_url( 'elementor-icons', 'assets/lib/eicons/css/' ),
			[],
			'5.6.2'
		);

		wp_register_style(
			'elementor-common',
			$this->get_css_assets_url( 'common' . $direction_suffix ),
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_style(
			'elementor-app',
			$this->get_css_assets_url( 'app' . $direction_suffix ),
			[
				'elementor-icons',
				'elementor-common',
			],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'elementor-app-packages',
			$this->get_js_assets_url( 'app-packages' ),
			[
				'wp-i18n',
				'react',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_script(
			'elementor-app',
			$this->get_js_assets_url( 'app' ),
			[
				'react',
				'react-dom',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'elementor-app', 'elementor', ELEMENTOR_PATH . 'languages' );

		$this->print_config();
	}

	public function enqueue_app_loader() {
		wp_enqueue_script(
			'elementor-app-loader',
			$this->get_js_assets_url( 'app-loader' ),
			[
				'elementor-common',
			],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config( 'elementor-app-loader' );
	}

	public function __construct() {
		$this->add_component( 'site-editor', new Modules\SiteEditor\Module() );

		add_action( 'admin_menu', [ $this, 'register_admin_menu' ], 21 /* after Elementor page */ );

		// Happens after WP plugin page validation.
		add_filter( 'add_menu_classes', [ $this, 'fix_submenu' ] );

		if ( $this->is_current() ) {
			add_action( 'admin_init', [ $this, 'admin_init' ], 0 );
		} else {
			add_action( 'elementor/common/after_register_scripts', [ $this, 'enqueue_app_loader' ] );
		}
	}
}

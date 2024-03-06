<?php
namespace Elementor\Modules\Home;

use Elementor\Modules\Home\Home_Menu_item;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Admin\Menu\Main as MainMenu;
use Elementor\Plugin;
use Elementor\Core\Base\App as BaseApp;;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseApp {

	const PAGE_ID = 'elementor-home';

	public function get_name() {
		return 'home';
	}

	private function register_admin_menu( MainMenu $menu ) {
		$menu->add_submenu( [
			'page_title' => __( 'Home', 'elementor' ),
			'menu_title' => '<span id="e-admin-menu__home">' . __( 'Home', 'elementor' ) . '</span>',
			'menu_slug' => Plugin::$instance->app->get_base_url() . '#/elementor-home',
			'index' => 41,
		] );
	private function enqueue_main_script() {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'e-home-screen',
			ELEMENTOR_ASSETS_URL . 'js/e-home-screen' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'e-home-screen', 'elementor' );
	}

	public function __construct() {
		parent::__construct();

		// @David: what is the comment about?
		//     Admin_Pointers::add_hooks();

		add_action( 'admin_init', function() { // HVV: Not sure about which hook we should use here.
			$this->enqueue_main_script();
		} );

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Home_Menu_item() );
		}, 115 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
			}
		}, 10, 2 );

		// Add the Elementor Apps link to the plugin install action links.
		add_filter( 'install_plugins_tabs', [ $this, 'add_elementor_plugin_install_action_link' ] );
		add_action( 'install_plugins_pre_elementor', [ $this, 'maybe_open_elementor_tab' ] );
		add_action( 'admin_print_styles-plugin-install.php', [ $this, 'add_plugins_page_styles' ] );
	}

	/**
	 * Register the admin menu the old way.
	 */
	private function register_admin_menu_legacy() {
		add_submenu_page(
			'elementor',
			__( 'Home', 'elementor' ),
			__( 'Home', 'elementor' ),
			'manage_options',
			Plugin::$instance->app->get_base_url() . '#/home-screen'
		);
	}

	public function __construct() {
		parent::__construct();


		// For cloud purposes
		if ( Plugin::$instance->experiments->is_feature_active( 'admin_menu_rearrangement' ) ) {
			add_action( 'elementor/admin/menu_registered/elementor', function ( MainMenu $menu ) {
				$this->register_admin_menu( $menu );
			} );
		} else {
			add_action( 'admin_menu', function () {
				$this->register_admin_menu_legacy();
			}, 51 /* after Elementor page */ );
		}
//		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
//			$admin_menu->register( static::PAGE_ID, new Home_Menu_item() );
//		}, 115 );
//
//		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
//			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
//				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
//			}
//		}, 10, 2 );

	}
}

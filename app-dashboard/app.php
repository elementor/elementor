<?php
namespace Elementor\App_Dashboard;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\App as BaseApp;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class App extends BaseApp {

	const PAGE_ID = 'elementor-dashboard';

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
		return 'app-dashboard';
	}

	public function get_base_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_ID . '&ver=' . ELEMENTOR_VERSION . '#/dashboard' );
	}

	private function register_admin_menu( Admin_Menu_Manager $admin_menu ) {
		$admin_menu->register( static::PAGE_ID, new Dashboard_Menu_Item() );
		$admin_menu->register( 'index', new Wp_Menu_Item() );
	}

	public function is_current() {
		return ( ! empty( $_GET['page'] ) && self::PAGE_ID === $_GET['page'] );
	}

	public function fix_menu( $menu ) {
		$dashboard_item = [];
		$wp_item = [];
		$separator = [];

		foreach ( $menu as $item_key => $menu_item ) {
			if ( 'New Elementor' === $menu_item[0] ) {
				$dashboard_item = $menu_item;
				unset( $menu[ $item_key ] );
			}

			if ( 'Wordpress' === $menu_item[0] ) {
				$wp_item = $menu_item;
				unset( $menu[ $item_key ] );
			}

			if ( '' === $menu_item[0] || 'Dashboard' === $menu_item[0] || 'Elementor' === $menu_item[0] || 'Templates' === $menu_item[0] ) {
				unset( $menu[ $item_key ] );
			}
		}

		$dashboard_item[0] = 'Elementor';
		$dashboard_item[2] = $this->get_base_url();
		$wp_item[2] = admin_url( 'options-general.php' );
		$wp_item[6] = 'dashicons-wordpress';

		$new_menu = [];
		$new_menu[] = $dashboard_item;
		$new_menu[] = $wp_item;
		$new_menu[] = $separator;
		foreach ( $menu as $item ) {
			$new_menu[] = $item;
		}

		return $new_menu;
	}

	public function fix_active_menu( $menu ) {
		foreach ( $menu as $item_key => $menu_item ) {
			if ('Wordpress' === $menu_item[0] || 'Elementor' === $menu_item[0]) {
				continue;
			}

			unset($menu[$item_key]);
		}

		return $menu;
	}

	public function admin_init() {
		do_action( 'elementor/app/init', $this );

		$this->enqueue_assets();
	}

	private function enqueue_assets() {
		wp_enqueue_script(
			'elementor-app-dashboard',
			$this->get_js_assets_url( 'app-dashboard' ),
			[
				'wp-url',
				'wp-i18n',
				'react',
				'react-dom',
				'elementor-app',
				'select2',
			],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function edit_logout_label( $wp_admin_bar ) {
		$wp_admin_bar->add_node(
			array(
				'parent' => 'user-actions',
				'id'     => 'logout',
				'title'  => __( 'Log Out from WordPress', 'elementor' ),
				'href'   => wp_logout_url(),
			)
		);
	}

	public function __construct() {
		add_action( 'admin_bar_menu', function ( $wp_admin_bar ) {
			$this->edit_logout_label( $wp_admin_bar );
		}, 1 );

		$this->add_component( 'dashboard', new Modules\Dashboard\Module() );

		add_action( 'elementor/admin/menu/register', function ( Admin_Menu_Manager $admin_menu ) {
			$this->register_admin_menu( $admin_menu );
		}, 1 );

		//      add_action( 'elementor/admin/menu/register', function ( Admin_Menu_Manager $admin_menu ) {
		//          $this->register_wp_admin_menu( $admin_menu );
		//      }, 2 );

		// Happens after WP plugin page validation.
		add_filter( 'add_menu_classes', [ $this, 'fix_menu' ] );

		add_action( 'admin_init', [ $this, 'admin_init' ], 0 );

		if ( $this->is_current() ) {
			add_filter( 'add_menu_classes', [ $this, 'fix_active_menu' ] );
		}

		if ( ( ! empty( $_GET['hide_wp'] ) && 'true' === $_GET['hide_wp'] ) ) {
			wp_enqueue_style(
				'elementor-hide-wp',
				$this->get_css_assets_url( 'modules/app-dashboard/app' ),
				[],
				ELEMENTOR_VERSION
			);
		}
	}
}

<?php
namespace Elementor\Modules\Home;

use Elementor\Modules\Home\Home_Menu_item;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const PAGE_ID = 'elementor-home';

	public function get_name() {
		return 'home';
	}

	public function __construct() {
		parent::__construct();

		//     Admin_Pointer::add_hooks();

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

	public function enqueue_assets() {
		add_filter( 'admin_body_class', [ $this, 'body_status_classes' ] );

		wp_enqueue_style(
			'elementor-apps',
			$this->get_css_assets_url( 'modules/apps/admin' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function body_status_classes( $admin_body_classes ) {
		$admin_body_classes .= ' elementor-apps-page';

		return $admin_body_classes;
	}

	public function add_elementor_plugin_install_action_link( $tabs ) {
		$tabs['elementor'] = esc_html__( 'For Elementor', 'elementor' );

		return $tabs;
	}

	public function maybe_open_elementor_tab() {
		if ( ! isset( $_GET['tab'] ) || 'elementor' !== $_GET['tab'] ) {
			return;
		}

		$elementor_url = add_query_arg( [
			'page' => static::PAGE_ID,
			'tab' => 'elementor',
			'ref' => 'plugins',
		], admin_url( 'admin.php' ) );

		wp_safe_redirect( $elementor_url );
		exit;
	}
}

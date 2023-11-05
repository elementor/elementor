<?php
namespace Elementor\Modules\ElementsManager;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const PAGE_ID = 'elementor-elements-manager';

	public function get_name() {
		return 'elements-manager';
	}

	public function __construct() {
		parent::__construct();

		$ajax = new Ajax();
		$ajax->register_endpoints();

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Admin_Menu_Apps() );
		}, 25 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
			}
		}, 10, 2 );

		add_filter( 'elementor/widgets_manager/is_widget_registered', function( $should_register, Widget_Base $widget_instance ) {
			return ! Options::is_widget_disabled( $widget_instance->get_name() );
		}, 10, 2 );
	}

	public function enqueue_assets() {
		wp_enqueue_script(
			'e-elements-manager-app',
			$this->get_js_assets_url( 'elements-manager-admin' ),
			[
				'wp-element',
				'wp-components',
				'wp-dom-ready',
			],
			ELEMENTOR_VERSION
		);

		wp_localize_script( 'e-elements-manager-app', 'eElementsManagerConfig', [
			'nonce' => wp_create_nonce( 'e-elements-manager-app' ),
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
		] );

		wp_enqueue_style( 'wp-components' );
	}
}

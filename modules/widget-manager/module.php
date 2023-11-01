<?php
namespace Elementor\Modules\WidgetManager;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Widget_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const PAGE_ID = 'elementor-widget-manager';

	public function get_name() {
		return 'widget-manager';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/admin/menu/register', function( Admin_Menu_Manager $admin_menu ) {
			$admin_menu->register( static::PAGE_ID, new Admin_Menu_Apps() );
		}, 125 );

		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			if ( ! empty( $hooks[ static::PAGE_ID ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ static::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
			}
		}, 10, 2 );

		add_action( 'wp_ajax_elementor_widget_manager_get_admin_app_data', function() {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error();
			}

			if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'e-widget-manager-app' ) ) {
				wp_send_json_error();
			}

			add_filter( 'elementor/widgets_manager/is_widget_registered', '__return_true', 100 );

			$widgets = [];

			foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $widget ) {
				if ( ! $widget->show_in_panel() ) {
					continue;
				}

				$classReflection = new \ReflectionClass( $widget );

				$plugin_basename = plugin_basename($classReflection->getFileName());

				$value = strtok( $plugin_basename, '/' );

				$value = get_plugins( '/' . $value );
				$value = array_shift( $value );

				$widgets[] = [
					'name' => $widget->get_name(),
					'plugin' => $value['Name'],
					'title' => $widget->get_title(),
				];
			}

			$data = [
				'disabled_widgets' => Options::get_disabled_widgets(),
				'widgets' => $widgets,
			];
			wp_send_json_success( $data );
		} );

		add_action( 'wp_ajax_elementor_widget_manager_save_disabled_widgets', function() {
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error();
			}

			if ( empty( $_POST['widgets'] ) ) {
				wp_send_json_error();
			}

			if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'e-widget-manager-app' ) ) {
				wp_send_json_error();
			}

			$disabled_widgets = json_decode( wp_unslash( $_POST['widgets'] ) );

			if ( ! is_array( $disabled_widgets ) ) {
				wp_send_json_error();
			}

			Options::update_disabled_widgets( $disabled_widgets );

			wp_send_json_success();
		} );

		add_filter( 'elementor/widgets_manager/is_widget_registered', function( $should_register, Widget_Base $widget_instance ) {
			return ! Options::is_widget_disabled( $widget_instance->get_name() );
		}, 10, 2 );
	}

	public function enqueue_assets() {
		wp_enqueue_script(
			'e-widget-manager-app',
			$this->get_js_assets_url( 'widget-manager-admin' ),
			[
				'wp-element',
				'wp-components',
				'wp-dom-ready',
			],
			ELEMENTOR_VERSION
		);

		wp_localize_script( 'e-widget-manager-app', 'eWidgetManagerConfig', [
			'nonce' => wp_create_nonce( 'e-widget-manager-app' ),
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
		] );

		wp_enqueue_style( 'wp-components' );
	}
}

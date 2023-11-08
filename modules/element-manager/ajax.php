<?php
namespace Elementor\Modules\ElementManager;

use Elementor\Modules\Usage\Module as Usage_Module;
use Elementor\Api;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ajax {

	public function register_endpoints() {
		add_action( 'wp_ajax_elementor_element_manager_get_admin_app_data', [ $this, 'ajax_get_admin_page_data' ] );
		add_action( 'wp_ajax_elementor_element_manager_save_disabled_elements', [ $this, 'ajax_save_disabled_elements' ] );
		add_action( 'wp_ajax_elementor_element_manager_get_usage_widgets', [ $this, 'ajax_get_usage_widgets' ] );
	}

	public function ajax_get_admin_page_data() {
		$this->verify_nonce();
		$this->disable_unregister_widgets();

		$widgets = [];
		$plugins = [];

		foreach ( Plugin::$instance->widgets_manager->get_widget_types() as $widget ) {
			if ( ! $widget->show_in_panel() ) {
				continue;
			}

			$plugin_name = $this->get_plugin_name_from_widget_instance( $widget );

			if ( ! in_array( $plugin_name, $plugins ) ) {
				$plugins[] = $plugin_name;
			}

			$widgets[] = [
				'name' => $widget->get_name(),
				'plugin' => $plugin_name,
				'title' => $widget->get_title(),
			];
		}

		$data = [
			'disabled_elements' => Options::get_disabled_elements(),
			'promotion_widgets' => [],
			'widgets' => $widgets,
			'plugins' => $plugins,
		];

		if ( ! Utils::has_pro() ) {
			$data['promotion_widgets'] = Api::get_promotion_widgets();
		}

		wp_send_json_success( $data );
	}

	private function verify_nonce() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error();
		}

		if ( empty( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'e-element-manager-app' ) ) {
			wp_send_json_error();
		}
	}

	private function disable_unregister_widgets() {
		add_filter( 'elementor/widgets_manager/is_widget_registered', '__return_true', 100 );
	}

	private function get_plugin_name_from_widget_instance( $widget ) {
		$classReflection = new \ReflectionClass( $widget );

		$plugin_basename = plugin_basename( $classReflection->getFileName() );

		$plugin_directory = strtok( $plugin_basename, '/' );

		$plugins_data = get_plugins( '/' . $plugin_directory );
		$plugin_data = array_shift( $plugins_data );

		return $plugin_data['Name'] ?? __( 'Unknown', 'elementor' );
	}

	public function ajax_save_disabled_elements() {
		$this->verify_nonce();

		if ( empty( $_POST['widgets'] ) ) {
			wp_send_json_error();
		}

		$disabled_elements = json_decode( wp_unslash( $_POST['widgets'] ) );

		if ( ! is_array( $disabled_elements ) ) {
			wp_send_json_error();
		}

		Options::update_disabled_elements( $disabled_elements );

		wp_send_json_success();
	}

	public function ajax_get_usage_widgets() {
		$this->verify_nonce();

		/** @var Usage_Module $usage_module */
		$usage_module = Usage_Module::instance();
		$usage_module->recalc_usage();

		$usage_widgets = [];
		foreach ( $usage_module->get_formatted_usage( 'raw' ) as $data ) {
			foreach ( $data['elements'] as $element => $count ) {
				if ( ! isset( $usage_widgets[ $element ] ) ) {
					$usage_widgets[ $element ] = 0;
				}

				$usage_widgets[ $element ] += $count;
			}
		}

		wp_send_json_success( $usage_widgets );
	}
}

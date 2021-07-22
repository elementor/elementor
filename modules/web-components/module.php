<?php

namespace Elementor\Modules\WebComponents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorPro\Core\Modules_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	/**
	 * @return bool
	 */
	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( 'e_components' );
	}

	public static function get_experimental_data() {
		return [
			'name' => 'e_components',
			'title' => __( 'Elementor Web Components', 'elementor' ),
			'description' => __( 'Modern elementor components', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_BETA,
			'new_site' => [
				'default_active' => true,
			],
		];
	}

	private function get_assets_path() {
		return ELEMENTOR_URL . "modules/web-components/assets";
	}

	/**
	 * @return string
	 */
	public function get_name() {
		return 'web-components';
	}

	protected function get_init_settings() {
		return [
			'is_administrator' => current_user_can( 'manage_options' ),
		];
	}

	/**
	 * Register Frontend styles
	 */
	public function register_frontend_styles() {
		wp_enqueue_style(
			'ewc-variables',
			$this->get_assets_path() . '/style/variables.css',
			[],
			'0.0.1'
		);
	}

	/**
	 * Register Frontend scripts
	 */
	public function register_frontend_scripts() {
		wp_register_script(
			'ewc-heading',
			$this->get_assets_path() . '/heading.js',
			[],
			'0.0.1',
			false
		);
		// wp_register_script( 'webcomponents-loader', '', [], '1.0.0', false );
	}

	/**
	 * Register Editor scripts
	 */
	public function register_editor_scripts() {

		// wp_register_script( 'webcomponents-loader', '', [], '1.0.0', false );
	}

	/**
	 * Get the module's associated widgets.
	 *
	 * @return string[]
	 */
	protected function get_widgets() {
		return [];
	}

	/**
	 * Initialize the module related widgets.
	 */
	public function init_widgets() {
		$widget_manager = Plugin::instance()->widgets_manager;

		foreach ( $this->get_widgets() as $widget ) {
			$class_name = $this->get_reflection()->getNamespaceName() . '\WebComponents\\' . $widget;

			$widget_manager->register_widget_type( new $class_name() );
		}
	}

	public function load_component_as_module( $tag, $handle, $src ) {
		if ( preg_match( '/^ewc-/', $handle ) ) {
			$tag = '<script type="module" src="' . esc_url( $src ) . '" class="ewc-module" id="' . $handle . '"></script>';
		}

		return $tag;
	}

	/**
	 * Module constructor.
	 */
	public function __construct() {
		if ( ! $this->is_active() ) {
			return;
		}

		parent::__construct();

		add_action( 'elementor/frontend/before_register_scripts', [ $this, 'register_frontend_scripts' ] );
		add_action( 'elementor/frontend/before_register_styles', [ $this, 'register_frontend_styles' ] );
		add_action( 'elementor/elements/categories_registered', function( $elements_manager ) {
			$elements_manager->add_category(
				'web-components',
				[
					'title' => __( 'Web Components', 'elementor' ),
					'icon' => 'eicon-pojome',
				]
			);
		} );

		add_action( 'elementor/widgets/widgets_registered', [ $this, 'init_widgets' ] );
		add_filter( 'script_loader_tag', [ $this, 'load_component_as_module' ], 10, 3 );
	}
}

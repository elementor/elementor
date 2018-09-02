<?php
namespace Elementor\Core\Common;

use Elementor\Core\Base\App as BaseApp;

class App extends BaseApp {

	public function get_name() {
		return 'common';
	}

	public function enqueue_scripts(){
		wp_register_script(
			'backbone-marionette',
			$this->get_js_assets_url( 'backbone.marionette', 'assets/lib/backbone/' ),
			[
				'backbone',
			],
			'2.4.5',
			true
		);

		wp_register_script(
			'backbone-radio',
			$this->get_js_assets_url( 'backbone.radio', 'assets/lib/backbone/' ),
			[
				'backbone',
			],
			'1.0.4',
			true
		);

		wp_register_script(
			'elementor-dialog',
			$this->get_js_assets_url( 'dialog', 'assets/lib/dialog/' ),
			[
				'jquery-ui-position',
			],
			'4.5.0',
			true
		);

		wp_register_script(
			'elementor-common',
			$this->get_js_assets_url( 'common' ),
			[
				'jquery',
				'backbone-marionette',
				'backbone-radio',
				'elementor-dialog',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_enqueue_script( 'elementor-common' );

		wp_localize_script( 'elementor-common', 'elementorAppConfig', json_encode( $this->get_components_settings() ) );
	}

	private function get_components_settings(){
		$settings = [];

		foreach ( $this->get_components() as $id => $instance ) {
			$settings[ $id ] = $instance->get_settings();
		}

		return $settings;
	}

	public function __construct() {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}
}

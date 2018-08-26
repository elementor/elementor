<?php
namespace Elementor\Core\App;

use Elementor\Core\Base\Module as BaseModule;

class Module extends BaseModule {

	public function get_name() {
		return 'app';
	}

	public function enqueue_scripts(){
		wp_register_script(
			'elementor-app',
			$this->get_assets_src( 'core/assets/js/app', 'js' ),
			[
				'jquery',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_add_inline_script( 'elementor-app', 'var ElementorAppConfig = ' . json_encode( $this->get_components_settings() ) );
	}

	private function get_components_settings(){
		$settings = [];
		foreach ( $this->get_components() as $id => $instance ) {
			$settings[ $id ] = $instance->get_settings();
		}

		return $settings;
	}

	private function get_assets_src( $relative_path, $ext ) {
		static $suffix = null;

		if ( null === $suffix ) {
			$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG || defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) ? '' : '.min';
		}

		return ELEMENTOR_URL . $relative_path. $suffix . '.' . $ext;
	}

	public function __construct() {
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}
}

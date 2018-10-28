<?php
namespace Elementor\Core\Common;

use Elementor\Core\Base\App as BaseApp;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Common\Modules\Assistant\Module as Assistant;

class App extends BaseApp {

	private $templates = [];

	public function __construct() {
		$this->add_default_templates();

		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_scripts' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );

		add_action( 'elementor/editor/before_enqueue_styles', [ $this, 'register_styles' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'register_styles' ] );
		add_action( 'wp_enqueue_scripts', [ $this, 'register_styles' ] );

		add_action( 'elementor/editor/footer', [ $this, 'print_templates' ] );
		add_action( 'admin_footer', [ $this, 'print_templates' ] );
		add_action( 'wp_footer', [ $this, 'print_templates' ] );
	}

	public function init_components() {
		$this->add_component( 'ajax', new Ajax() );

		if ( current_user_can( 'manage_options' ) ) {
			$this->add_component( 'assistant', new Assistant() );
		}
	}

	public function get_name() {
		return 'common';
	}

	public function register_scripts() {
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
			'4.5.1',
			true
		);

		wp_enqueue_script(
			'elementor-common',
			$this->get_js_assets_url( 'common' ),
			[
				'jquery',
				'jquery-ui-draggable',
				'backbone-marionette',
				'backbone-radio',
				'elementor-dialog',
			],
			ELEMENTOR_VERSION,
			true
		);

		$this->print_config();
	}

	public function register_styles() {
		wp_register_style(
			'elementor-common',
			$this->get_css_assets_url( 'common', null, 'default', true ),
			[],
			ELEMENTOR_VERSION
		);
	}

	/**
	 * Add template.
	 *
	 * @access public
	 *
	 * @param string $template Can be either a link to template file or template
	 *                         HTML content.
	 * @param string $type     Optional. Whether to handle the template as path
	 *                         or text. Default is `path`.
	 */
	public function add_template( $template, $type = 'path' ) {
		if ( 'path' === $type ) {
			ob_start();

			include $template;

			$template = ob_get_clean();
		}

		$this->templates[] = $template;
	}

	public function print_templates() {
		foreach ( $this->templates as $template ) {
			echo $template;
		}
	}

	protected function get_init_settings() {
		return [
			'version' => ELEMENTOR_VERSION,
			'isRTL' => is_rtl(),
			'activeModules' => array_keys( $this->get_components() ),
			'urls' => [
				'assets' => ELEMENTOR_ASSETS_URL,
			],
		];
	}

	private function add_default_templates() {
		$default_templates = [
			'includes/editor-templates/library-layout.php',
		];

		foreach ( $default_templates as $template ) {
			$this->add_template( ELEMENTOR_PATH . $template );
		}
	}
}

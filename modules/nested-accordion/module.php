<?php
namespace Elementor\Modules\NestedAccordion;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( 'nested-elements', true );
	}

	public function get_name() {
		return 'nested-accordion';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

		add_action( 'elementor/frontend/after_register_script_modules', [ $this, 'register_script_modules' ] );
	}

	/**
	 * Register styles.
	 *
	 * At build time, Elementor compiles `/modules/nested-accordion/assets/scss/frontend.scss`
	 * to `/assets/css/widget-nested-accordion.min.css`.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'widget-nested-accordion',
			$this->get_css_assets_url( 'widget-nested-accordion', null, true, true ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION
		);
	}

	public function register_script_modules(): void {
		wp_register_script_module(
			'elementor_nested_accordion',
			ELEMENTOR_URL . 'modules/nested-accordion/assets/js/frontend/handlers/nested-accordion.js',
			[],
			ELEMENTOR_VERSION,
		);

		wp_register_script_module(
			'elementor_handler_nested_accordion_keyboard',
			$this->get_js_assets_url( 'frontend-handler-nested-accordion-keyboard', 'assets/js/' ),
			[],
			ELEMENTOR_VERSION
		);
	}
}

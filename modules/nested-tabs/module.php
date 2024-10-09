<?php
namespace Elementor\Modules\NestedTabs;

use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Plugin;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {
	private Wordpress_Adapter_Interface $wordpress_adapter;

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( NestedElementsModule::EXPERIMENT_NAME );
	}

	public function get_name() {
		return 'nested-tabs';
	}

	public function __construct( ?Wordpress_Adapter_Interface $wordpress_adapter = null ) {
		parent::__construct();

		$this->wordpress_adapter = $wordpress_adapter ?? new Wordpress_Adapter();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

		add_action( 'wp_enqueue_scripts', [ $this, 'register_scripts' ] );
	}

	/**
	 * Register styles.
	 *
	 * At build time, Elementor compiles `/modules/nested-tabs/assets/scss/frontend.scss`
	 * to `/assets/css/widget-nested-tabs.min.css`.
	 *
	 * @return void
	 */
	public function register_styles() {
		$direction_suffix = is_rtl() ? '-rtl' : '';
		$has_custom_breakpoints = Plugin::$instance->breakpoints->has_custom_breakpoints();

		wp_register_style(
			'widget-nested-tabs',
			$this->get_frontend_file_url( "widget-nested-tabs{$direction_suffix}.min.css", $has_custom_breakpoints ),
			[ 'elementor-frontend' ],
			$has_custom_breakpoints ? null : ELEMENTOR_VERSION
		);
	}

	/**
	 * Register script modules.
	 *
	 * @return void
	 */
	public function register_scripts() {
		wp_register_script(
			'script-module-flex-horizontal-scroll',
			ELEMENTOR_URL . 'assets/dev/js/frontend/utils/flex-horizontal-scroll.js',
			[],
			ELEMENTOR_VERSION
		);

		wp_register_script(
			'script-module-nested-title-keyboard-handler',
			ELEMENTOR_URL . 'assets/dev/js/frontend/handlers/accessibility/nested-title-keyboard-handler.js',
			[ 'script-module-handlers-base' ],
			ELEMENTOR_VERSION
		);

		wp_register_script(
			'script-module-widget-nested-tabs',
			ELEMENTOR_URL . 'modules/nested-tabs/assets/js/frontend/handlers/nested-tabs.js',
			[ 'script-module-handlers-base' ],
			ELEMENTOR_VERSION
		);
	}
}

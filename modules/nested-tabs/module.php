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

	private Wordpress_Adapter|Wordpress_Adapter_Interface $wordpress_adapter;

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( NestedElementsModule::EXPERIMENT_NAME );
	}

	public function get_name() {
		return 'nested-tabs';
	}

	public function __construct( ?Wordpress_Adapter_Interface $wordpress_adapter = null ) {
		parent::__construct();

		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

		add_action( 'elementor/frontend/after_register_script_modules', [ $this, 'register_script_modules' ] );

		$this->wordpress_adapter = $wordpress_adapter ?? new Wordpress_Adapter();
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

	public function register_script_modules(): void {
		$this->wordpress_adapter->wp_register_script_module(
			'elementor_nested_tabs',
			ELEMENTOR_URL . 'modules/nested-tabs/assets/js/frontend/handlers/nested-tabs.js',
			[],
			ELEMENTOR_VERSION,
		);
	}
}

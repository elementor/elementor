<?php
namespace Elementor\Modules\NestedTabs;

use Elementor\Plugin;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( NestedElementsModule::EXPERIMENT_NAME );
	}

	public function get_name() {
		return 'nested-tabs';
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

		$file_relative_path = 'assets/js/frontend/handlers/nested-tabs.js';

		$file_path = plugin_dir_path( __FILE__ ) . $file_relative_path;

		$file_url = ELEMENTOR_URL . 'modules/nested-tabs/' . $file_relative_path;
		$version = file_exists( $file_path ) ? filemtime( $file_path ) : ELEMENTOR_VERSION;

		echo $file_path . '<br />';

		echo $file_url . '<br />';

		if ( file_exists( $file_path ) ) {
			echo 'file exists';
		} else {
			echo 'file exists not';
		}

		wp_register_script_module(
			'elementor_nested_tabs',
			$file_url,
			[],
			$version
		);
	}
}

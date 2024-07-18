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

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );

		add_action( 'wp_enqueue_scripts', [ $this, 'register_style' ] );
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_style() {
		// At build time, Elementor compiles `/modules/nested-tabs/assets/scss/frontend.scss` to `/assets/css/widget-nested-tabs.css`.
		wp_register_style(
			'widget-nested-tabs',
			$this->get_css_assets_url( 'widget-nested-tabs' ),
			[],
			ELEMENTOR_VERSION
		);
	}
}

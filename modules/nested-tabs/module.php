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

		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_style' ] );
	}

	/**
	 * Enqueue scripts.
	 *
	 * @return void
	 */
	public function enqueue_scripts() {
		wp_enqueue_script(
			$this->get_name(),
			$this->get_js_assets_url( $this->get_name() ),
			[ 'nested-elements' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	/**
	 * Register styles.
	 *
	 * @return void
	 */
	public function register_style() {
		wp_register_style(
			$this->get_name(),
			$this->get_css_assets_url( 'frontend', 'assets/css/modules/nested-tabs/' ),
			[],
			ELEMENTOR_VERSION
		);
	}
}

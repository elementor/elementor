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

		add_action( 'elementor/frontend/enqueue_widgets', [ $this, 'enqueue_style' ] );
	}

	/**
	 * Enqueues style for this widget.
	 *
	 * @return void
	 */
	public function enqueue_style(): void {
		wp_enqueue_style(
			$this->get_name(),
			$this->get_css_assets_url( 'frontend', 'assets/css/modules/nested-tabs/' ),
			[],
			ELEMENTOR_VERSION
		);
	}
}

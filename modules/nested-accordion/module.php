<?php
namespace Elementor\Modules\NestedAccordion;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( 'nested-elements' );
	}

	public function get_name() {
		return 'nested-accordion';
	}

	public function get_widgets() {
		return [
			'Nested_Accordion',
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );
	}
}

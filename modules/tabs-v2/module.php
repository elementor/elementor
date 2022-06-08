<?php
namespace Elementor\Modules\TabsV2;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

		return Plugin::$instance->experiments->is_feature_active( 'nested-elements' );
	}

	public function get_name() {
		return 'tabs-v2';
	}

	protected function get_widgets() {
		return [ 'TabsV2' ];
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

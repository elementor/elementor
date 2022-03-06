<?php
namespace Elementor\Modules\NestedTabs;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\NestedElements\Module as NestedTabsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public static function get_experimental_data() {
		return [
			'name' => 'nested-tab',
			'title' => esc_html__( 'Nested Tab', 'elementor' ),
			'description' => esc_html__( 'Nested Tabs', 'elementor' ), // TODO: Add description
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [ NestedTabsModule::class ],
		];
	}

	public function get_name() {
		return 'nested-tabs';
	}

	protected function get_widgets() {
		return [ 'NestedTabs' ];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/common/after_register_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'nested-elements',
			], ELEMENTOR_VERSION, true );
		} );
	}
}

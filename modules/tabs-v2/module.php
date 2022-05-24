<?php
namespace Elementor\Modules\TabsV2;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public static function get_experimental_data() {
		return [
			'name' => 'tabs-v2',
			'title' => esc_html__( 'Nested Tab', 'elementor' ),
			'description' => esc_html__( 'Nested Tabs', 'elementor' ), // TODO: Add description
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [ NestedElementsModule::class ],
		];
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

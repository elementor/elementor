<?php
namespace Elementor\Modules\NestedElements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public static function get_experimental_data() {
		return [
			'name' => 'nested-elements',
			'title' => esc_html__( 'Nested Elements', 'elementor' ),
			'description' => esc_html__( 'Adds a new Widgets Nesting capabilities that allows creating elements like Nested Tabs, Nested Accordions, etc.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [
				'container',
			],
		];
	}

	public function get_name() {
		return 'nested-elements';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/controls/controls_registered', function ( $controls_manager ) {
			$controls_manager->register_control( Controls\Control_Nested_Repeater::CONTROL_TYPE, new Controls\Control_Nested_Repeater() );
		} );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'elementor-common',
			], ELEMENTOR_VERSION, true );
		} );

		add_action( 'elementor/init', function () {
			// Register TabsV2 Module.
			Plugin::$instance->modules_manager->register_module(
				\Elementor\Modules\TabsV2\Module::class,
				'tabs-v2',
		);
		} );
	}
}

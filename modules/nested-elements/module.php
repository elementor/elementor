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
			'description' => esc_html__( 'Adds a new Elementor nested elements that allows creating nested tabs, nested according , etc...', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'dependency' => [
				'container',
			],
		];
	}

	public function get_name() {
		return 'nested-elements';
	}

	protected function get_widgets() {
		return [
			'NestedTabs',
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/controls/controls_registered', function ( $controls_manager ) {
			$controls_manager->register_control( Controls\Nested_Repeater::CONTROL_TYPE, new Controls\Nested_Repeater() );
		} );

		$this->enqueue_module_assets( [
			'elementor-common',
		] );
	}
}

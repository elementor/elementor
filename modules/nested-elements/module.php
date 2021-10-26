<?php
namespace Elementor\Modules\NestedElements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;

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

	private function enqueue_scripts() {
		wp_enqueue_script(
			'nested-elements',
			$this->get_js_assets_url( 'elementor-modules/nested-elements' ),
			[
				'elementor-common'
			],
			ELEMENTOR_VERSION
		);

	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/common/after_register_scripts', function () {
			$this->enqueue_scripts();
		} );
	}
}

<?php
namespace Elementor\Modules\KitsElementsDefaults;

use Elementor\Plugin;
use Elementor\Modules\KitsElementsDefaults\Data\Controller;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {
	public function get_name() {
		return 'kits-elements-defaults';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'kits-elements-defaults',
			'title' => __( 'Kit Elements Defaults', 'elementor' ),
			'description' => __( 'Set default values for all the elements in a kit.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-kits-elements-defaults-editor',
			$this->get_js_assets_url( 'kits-elements-defaults-editor' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );
	}
}

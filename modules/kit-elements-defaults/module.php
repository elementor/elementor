<?php
namespace Elementor\Modules\KitElementsDefaults;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {
	public function get_name() {
		return 'kit-elements-defaults';
	}

	public static function get_experimental_data() {
		$is_debug = defined( 'ELEMENTOR_DEBUG' ) && ELEMENTOR_DEBUG;

		return [
			'name' => 'kit-elements-defaults',
			'title' => __( 'Kit Elements Defaults', 'elementor' ),
			'description' => __( 'Set default values for all the elements in a kit.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'hidden' => ! $is_debug,
		];
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-kit-elements-defaults-editor',
			$this->get_js_assets_url( 'kit-elements-defaults-editor' ),
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

		( new Controller() )->register();
	}
}

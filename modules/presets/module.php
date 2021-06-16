<?php
namespace Elementor\Modules\Presets;

use Elementor\Core\Experiments\Manager;
use Elementor\Core\Base\Module as Base_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends Base_Module {
	public static function get_experimental_data() {
		return [
			'name' => 'presets',
			'title' => __( 'Presets', 'elementor' ),
			'description' => __( 'This is presets!!!', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}

	public function get_name() {
		return 'presets';
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'editor-presets',
			$this->get_js_assets_url( 'editor-presets' ),
			[
				'elementor-common',
			],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_scripts();
		} );
	}
}

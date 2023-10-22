<?php
namespace Elementor\Modules\OptimizeControls;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'optimize-controls';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'e_optimize_controls',
			'title' => esc_html__( 'Optimize Controls', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'generator_tag' => true,
		];
	}
}

<?php
namespace Elementor\Modules\DefaultValues;

use Elementor\Core\Experiments\Manager;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	/**
	 * @return string
	 */
	public function get_name() {
		return 'default-values';
	}

	/**
	 * @return array
	 */
	public static function get_experimental_data() {
		return [
			'name' => 'default-values',
			'title' => __( 'Default Values', 'elementor' ),
			'description' => __( 'This is default values!', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'default' => Manager::STATE_INACTIVE,
		];
	}
}

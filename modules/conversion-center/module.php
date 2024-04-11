<?php

namespace Elementor\Modules\ConversionCenter;

use Elementor\Core\Experiments\Manager;
use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'conversion-center';

	public static function is_active() {
		return Plugin::$instance->experiments->is_feature_active( static::EXPERIMENT_NAME );
	}

	public function get_name() {
		return static::EXPERIMENT_NAME;
	}

	public function get_widgets() {
		return [
			'Link_In_Bio',
		];
	}

	/**
	 * Add to the experiments
	 *
	 * @return array
	 */
	public static function get_experimental_data() {
		return [
			'name'           => static::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Conversion Center', 'elementor' ),
			'description'    => esc_html__( 'A powerful feature to enhance your online presence. With the ability to create compelling Link in bio pages and easily accessible contact buttons, the Conversion Center is tailored to significantly boost your conversions.', 'elementor' ),
			'hidden'         => true,
			'default'        => Manager::STATE_INACTIVE,
		];
	}

}

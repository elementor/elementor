<?php
namespace Elementor\Modules\ElementsColorPicker;

use Elementor\Core\Experiments\Manager;
use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'elements-color-picker';
	}

	public static function get_experimental_data() {
		return [
			'name' => 'elements-color-picker',
			'title' => __( 'Elements Color Picker', 'elementor' ),
			'default' => Manager::STATE_ACTIVE,
			'description' => __( 'Adds a new color picker functionality that allows choose a color from other elements settings.', 'elementor' ),
		];
	}
}

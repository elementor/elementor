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

	/**
	 * Scripts for module.
	 */
	public function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-elements-color-picker',
			$this->get_js_assets_url( 'elements-color-picker' ),
			[ 'elementor-editor' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function __construct() {
		add_action( 'elementor/editor/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}
}

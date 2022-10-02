<?php
namespace Elementor\Modules\EditorV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;

class Module extends BaseModule {

	public static function get_experimental_data() {
		return [
			'name' => 'editor-v2',
			'title' => esc_html__( 'Editor v2', 'elementor' ),
			'description' => esc_html__( 'Our new Editor, based on React and designed for better 3rd party integration.', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_DEV,
		];
	}

	public function get_name() {
		return 'editor-v2';
	}
}

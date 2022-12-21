<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Config_Provider implements Config_Provider_Interface {
	public function get_scripts() {
		return Editor_Common_Assets::get_scripts();
	}

	public function get_loader_scripts() {
		return [
			[
				'handle' => 'elementor-editor-loader-v1',
				'src' => ELEMENTOR_URL . 'core/editor/assets/js/editor-loader-v1.js',
				'deps' => [ 'elementor-editor' ],
			],
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v1.view.php';
	}
}

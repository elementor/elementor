<?php
namespace Elementor\Core\Editor\Loading_Strategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V1_Loading_Strategy extends Editor_Base_Loading_Strategy implements Loading_Strategy_Interface {
	public function get_scripts() {
		return parent::get_scripts();
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

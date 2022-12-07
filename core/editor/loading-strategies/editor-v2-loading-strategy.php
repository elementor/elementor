<?php
namespace Elementor\Core\Editor\Loading_Strategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Loading_Strategy extends Editor_Base_Loading_Strategy implements Loading_Strategy_Interface {
	public function get_scripts() {
		$scripts = parent::get_scripts();

		// Here we should add a filter to allow packages to REGISTER their scripts.

		return $scripts;
	}

	public function get_loader_scripts() {
		$deps = [ 'elementor-editor' ];

		// Here we should add filter to allow packages LOAD their scripts with the loader.

		return [
			[
				'handle' => 'elementor-editor-loader-v2',
				'src' => ELEMENTOR_URL . 'core/editor/assets/js/editor-loader-v2.js',
				'deps' => $deps,
			],
		];
	}

	public function get_template_body_file_path() {
		return __DIR__ . '/../templates/editor-body-v2.view.php';
	}
}

<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Config_Provider implements Config_Provider_Interface {
	public function get_scripts() {
		$scripts = Editor_Common_Assets::get_scripts();

		// TODO: Choose a final name.
		$scripts = apply_filters( 'elementor/editor/v2/loader/scripts/register', $scripts );

		return $scripts;
	}

	public function get_loader_scripts() {
		$deps = [ 'elementor-editor' ];

		// TODO: Choose a final name.
		$deps = apply_filters( 'elementor/editor/v2/loader/scripts/dependencies', $deps );

		$deps = $this->ensure_registered_handles( $deps );

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

	private function ensure_registered_handles( $handles ) {
		return array_filter( $handles, function ( $handle ) {
			return wp_script_is( $handle, 'registered' );
		} );
	}
}

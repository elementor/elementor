<?php
namespace Elementor\Core\Editor\Loading_Strategies;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Editor_V2_Loading_Strategy extends Editor_Base_Loading_Strategy implements Loading_Strategy_Interface {
	public function get_scripts() {
		$scripts = parent::get_scripts();

		$scripts = apply_filters( 'elementor/editor/v2/loader/scripts/register', $scripts );

		return $scripts;
	}

	public function get_loader_scripts() {
		$deps = [ 'elementor-editor' ];

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

	// TODO: Make it recursive, so if a package has a non-registered dependency in it's tree,
	// 	it will be filtered out.
	private function ensure_registered_handles( $handles ) {
		return array_filter( $handles, function ( $handle ) {
			return wp_script_is( $handle, 'registered' );
		} );
	}
}

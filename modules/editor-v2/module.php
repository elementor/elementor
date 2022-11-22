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

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/before_enqueue_scripts', function() {
			$this->enqueue_scripts();
		} );

		add_action( 'elementor/editor/before_enqueue_styles', function() {
			$this->enqueue_styles();
		} );
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-editor-v2',
			$this->get_js_assets_url( 'editor-v2' ),
			[
				'react',
				'react-dom',
			],
			ELEMENTOR_VERSION,
			false
		);
	}

	private function enqueue_styles() {
		wp_enqueue_style(
			'elementor-editor-v2',
			$this->get_editor_package_url( 'css' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	private function get_editor_package_url( string $type ) {
		static $manifest = null;

		$manifest_relative_dir = 'packages/editor/build/';

		if ( ! $manifest ) {
			$manifest_path = ELEMENTOR_PATH . $manifest_relative_dir . 'asset-manifest.json';

			if ( ! file_exists( $manifest_path ) ) {
				return false;
			}

			$manifest = json_decode( file_get_contents( $manifest_path ) );
		}

		switch ( $type ) {
			case 'js':
				return ELEMENTOR_URL . $manifest_relative_dir . $manifest->entrypoints[1];
			case 'css':
				return ELEMENTOR_URL . $manifest_relative_dir . $manifest->entrypoints[0];
		}
	}
}

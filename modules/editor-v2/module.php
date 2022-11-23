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
			[],
			ELEMENTOR_VERSION,
			false
		);
	}

	private function enqueue_styles() {
		wp_enqueue_style(
			'elementor-editor-v2',
			$this->get_css_assets_url( 'style', '@editor/packages/app-editor-loader/dist/' ),
			[],
			ELEMENTOR_VERSION
		);
	}
}

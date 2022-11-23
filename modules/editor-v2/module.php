<?php
namespace Elementor\Modules\EditorV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Base\Module as BaseModule;

class Module extends BaseModule {

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

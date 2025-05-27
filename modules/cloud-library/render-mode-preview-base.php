<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Preview_Base extends Render_Mode_Base {

	public function prepare_render() {
		show_admin_bar( false );
		parent::prepare_render();
	}

	public static function enqueue_scripts_for_screenshot( $after = [] ) {
		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_enqueue_script(
			'dom-to-image',
			ELEMENTOR_ASSETS_URL . "/lib/dom-to-image/js/dom-to-image{$suffix}.js",
			[],
			'2.6.0',
			true
		);

		wp_enqueue_script(
			'html2canvas',
			ELEMENTOR_ASSETS_URL . "/lib/html2canvas/js/html2canvas{$suffix}.js",
			[],
			'1.4.1',
			true
		);

		wp_enqueue_script(
			'cloud-library-screenshot',
			ELEMENTOR_ASSETS_URL . "/js/cloud-library-screenshot{$suffix}.js",
			array_merge(
				[ 'dom-to-image', 'html2canvas' ],
				is_array( $after ) ? $after : [],
			),
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_scripts() {
		self::enqueue_scripts_for_screenshot();

		$config = $this->get_config();

		wp_add_inline_script( 'cloud-library-screenshot', 'var ElementorScreenshotConfig = ' . wp_json_encode( $config ) . ';' );
	}

	public function get_config() {
		return [];
	}
}

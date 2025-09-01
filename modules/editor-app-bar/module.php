<?php
namespace Elementor\Modules\EditorAppBar;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const PACKAGES = [
		'editor-app-bar',
	];

	const STYLES = [
		'editor-v2-app-bar-overrides',
	];

	public function get_name() {
		return 'editor-app-bar';
	}

	public function __construct() {
		parent::__construct();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_filter( 'elementor/editor/v2/styles', fn( $styles ) => $this->add_styles( $styles ) );
		add_filter( 'elementor/editor/templates', fn( $templates ) => $this->remove_templates( $templates ) );

		add_action( 'elementor/editor/v2/scripts/enqueue', fn() => $this->dequeue_scripts() );
		add_action( 'elementor/editor/v2/styles/enqueue', fn() => $this->dequeue_styles() );
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function add_styles( $styles ) {
		return array_merge( $styles, self::STYLES );
	}

	private function remove_templates( $templates ) {
		return array_diff( $templates, [ 'responsive-bar' ] );
	}

	private function dequeue_scripts() {
		wp_dequeue_script( 'elementor-responsive-bar' );
	}

	private function dequeue_styles() {
		wp_dequeue_style( 'elementor-responsive-bar' );
	}
}

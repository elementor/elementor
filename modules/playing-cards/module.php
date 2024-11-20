<?php
namespace Elementor\Modules\PlayingCards;

use Elementor\Core\Base\Module AS BaseModule;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	public function get_name() {
		return 'playing-cards';
	}

	protected function get_widgets() {
		return [
			'Playing_Cards',
		];
	}
	public function __construct() {
		parent::__construct();
		add_action( 'elementor/frontend/after_register_scripts', [ $this, 'register_scripts' ] );
		add_action( 'elementor/frontend/after_register_styles', [ $this, 'register_styles' ] );
	}

	public function register_styles() {
		$direction_suffix = is_rtl() ? '-rtl' : '';
		$has_custom_breakpoints = Plugin::$instance->breakpoints->has_custom_breakpoints();

		$widget_style_name = 'widget-playing-cards';

		wp_register_style(
			$widget_style_name,
			$this->get_frontend_file_url( "{$widget_style_name}{$direction_suffix}.min.css", $has_custom_breakpoints ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION
		);
	}

	public function register_scripts() {
		wp_register_script(
			'playing-cards-frontend',
			$this->get_js_assets_url( 'playing-cards' ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}

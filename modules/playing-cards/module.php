<?php
namespace Elementor\Modules\PlayingCards;

use Elementor\Core\Base\Module AS BaseModule;

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
		add_action( 'elementor/frontend/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
	}

	public function enqueue_styles() {
		wp_register_style(
			'playing-cards-frontend',
			$this->get_css_assets_url( 'modules/playing-cards/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function enqueue_scripts() {
		wp_register_script(
			'playing-cards-frontend',
			$this->get_js_assets_url( 'playing-cards' ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}

<?php

namespace Elementor\Modules\MemoryGame;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_widgets() {
		return [
			'MemoryGame',
		];
	}

	public function get_name() {
		return 'memory-game';
	}

	public function enqueue_scripts() {
		wp_enqueue_script(
			'memory-game-frontend',
			$this->get_js_assets_url( 'memory-game' ),
			[ 'elementor-frontend-modules' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	public function enqueue_styles() {
		wp_enqueue_style(
			'memory-game-frontend',
			$this->get_css_assets_url( 'modules/memory-game/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function __construct(...$args) {
		parent::__construct(...$args);
		add_action( 'elementor/frontend/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
	}
}

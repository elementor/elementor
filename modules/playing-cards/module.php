<?php
namespace Elementor\Modules\PlayingCards;

use Elementor\Plugin;
use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'playing-cards';
	}

	public function __construct(...$args) {
		parent::__construct(...$args);
		add_action( 'elementor/frontend/after_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
	}

	protected function get_widgets() {
		return [
			'CardsWidget'
		];
	}

	public function enqueue_scripts() {
		wp_enqueue_script(
		  'playing-cards-frontend',
		  $this->get_js_assets_url( 'playing-cards' ),
		  [ 'elementor-frontend' ],
		  ELEMENTOR_VERSION,
		  true
		);
	}

	public function enqueue_styles() {
		wp_enqueue_style(
		  'playing-cards-frontend',
		  $this->get_css_assets_url( 'modules/playing-cards/frontend' ),
		  [],
		  ELEMENTOR_VERSION
	   );
	}


	
}

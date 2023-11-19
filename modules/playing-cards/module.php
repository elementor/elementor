<?php
namespace Elementor\Modules\PlayingCards;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function get_name() {
		return 'playing-cards';
	}

	public function get_widgets() {
		return [
			'Playing_Cards'
		];
	}

	public function enqueue_styles(){
		wp_enqueue_style(
			'playing-cards-frontend',
			$this->get_css_assets_url( 'modules/playing-cards/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	public function __construct(){
		parent::__construct();
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
	}
}

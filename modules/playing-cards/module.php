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
		wp_register_style( 'frontend', plugins_url( 'assets/scss/frontend.scss', __FILE__ ) );
		wp_enqueue_style( 'frontend' );
	}

	public function enqueue_scripts(){
		wp_enqueue_script('playing-cards-frontend',
		$this->get_js_assets_url( 'playing-cards-frontend' ),
		[ 'elementor-frontend' ],
		ELEMENTOR_VERSION,
		true
		);
//		wp_register_script( 'frontend', plugins_url( 'assets/js/frontend.js', __FILE__ ) );
//		wp_enqueue_script( 'frontend' );
	}

	public function __construct(){
		parent::__construct();
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
		add_action( 'elementor/frontend/after_register_scripts', [ $this, 'enqueue_scripts' ] );
	}
}

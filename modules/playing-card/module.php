<?php
namespace Elementor\Modules\PlayingCard;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function __construct() {
		parent::__construct();
		add_action( 'elementor/frontend/after_enqueue_styles', [ $this, 'enqueue_styles' ] );
	}
	public function enqueue_styles() {
		wp_enqueue_style(
			'playing-card-frontend',
			$this->get_css_assets_url( 'modules/playing-card/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}


	public function get_name() {
		return 'playing-card';
	}

	protected function get_widgets() {
		return [
			'PlayingCardWidget',
		];
	}
}


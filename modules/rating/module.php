<?php
namespace Elementor\Modules\Rating;

use Elementor\Core\Base\Module as BaseModule;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'rating';
	}

	private function enqueue_scripts() {
		wp_enqueue_script(
			'elementor-rating',
			$this->get_js_assets_url( 'rating' ),
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}

	private function enqueue_styles() {
		wp_enqueue_style(
			'elementor-rating',
			$this->get_css_assets_url( 'modules/rating/frontend' ),
			[],
			ELEMENTOR_VERSION
		);
	}

	protected function get_widgets() {
		return [
			'Rating',
		];
	}


	public function __construct() {
		parent::__construct();

		add_action( 'wp_enqueue_scripts', function() {
			$this->enqueue_styles();
			$this->enqueue_scripts();
		} );

	}
}

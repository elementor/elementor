<?php

namespace Elementor\Modules\WpRest;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\WpRest\Classes\Elementor_Post_Meta;
use Elementor\Modules\WpRest\Classes\Elementor_Settings;
use Elementor\Modules\WpRest\Classes\Elementor_User_Meta;
use Elementor\Modules\WpRest\Classes\WP_Post;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'wp-rest';
	}

	public function __construct() {
		parent::__construct();
		add_action( 'rest_api_init', function () {
			( new Elementor_Post_Meta() )->register();
			( new Elementor_Settings() )->register();
			( new Elementor_User_Meta() )->register();
			( new WP_Post() )->register();
		} );
		add_action( 'elementor/editor/after_enqueue_scripts', fn () => $this->register_scripts() );
	}

	public function register_scripts() {
		wp_enqueue_script(
			'elementor-wp-rest',
			$this->get_js_assets_url( 'wp-rest' ),
			[],
			ELEMENTOR_VERSION,
			true
		);
	}
}

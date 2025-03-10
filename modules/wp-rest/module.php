<?php

namespace Elementor\Modules\WpRest;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\WpRest\Classes\Elementor_Post_Meta;
use Elementor\Modules\WpRest\Classes\Elementor_Settings;
use Elementor\Modules\WpRest\Classes\Elementor_User_Meta;
use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'wp-rest';
	}

	public function __construct( ?Wordpress_Adapter_Interface $wp_adapter = null ) {
		parent::__construct();

		$wp_adapter = $wp_adapter ?? new Wordpress_Adapter();

		add_action( 'rest_api_init', function () use ( $wp_adapter ) {
			( new Elementor_Post_Meta() )->register();
			( new Elementor_Settings() )->register();
			( new Elementor_User_Meta() )->register();
			( new WP_Post( $wp_adapter ) )->register();
		} );
	}
}

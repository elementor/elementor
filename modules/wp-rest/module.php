<?php

namespace Elementor\Modules\WpRest;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\WpRest\Classes\Elementor_Post_Meta;
use Elementor\Modules\WpRest\Classes\Elementor_Settings;
use Elementor\Modules\WpRest\Classes\Elementor_User_Meta;

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
		} );
	}
}

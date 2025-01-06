<?php

namespace Elementor\Modules\WpRest;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\WpRest\Classes\ElementorPostMeta;
use Elementor\Modules\WpRest\Classes\ElementorSettings;
use Elementor\Modules\WpRest\Classes\ElementorUserMeta;

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
			( new ElementorPostMeta() )->register();
			( new ElementorSettings() )->register();
			( new ElementorUserMeta() )->register();
		} );
	}
}

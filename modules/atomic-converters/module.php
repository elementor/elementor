<?php

namespace Elementor\Modules\AtomicConverters;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	public function get_name() {
		return 'atomic-converters';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'rest_api_init', function() {
			( new Css\Rest_Api() )->register_routes();
		} );
	}
}


<?php

namespace Elementor\Modules\WpRest;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\WpRest\Classes\ElementorPostMeta;
use Elementor\Modules\WpRest\Classes\ElementorSettings;
use Elementor\Modules\WpRest\Classes\ElementorUserMeta;

defined( 'ABSPATH' ) || exit;

class Module extends BaseModule {

	public function get_name() {
		return 'wp-rest';
	}

	public function __construct() {
		parent::__construct();
		add_action( 'rest_api_init', [ $this, 'on_rest_init' ] );

		add_filter('elementor/template_library/sources/local/register_post_type_args', function ( $args ) {
			$args['show_in_rest'] = true;
			$args['supports'][] = 'custom-fields';
			return $args;
		});
	}

	public function on_rest_init() {
		( new ElementorPostMeta() )->register();
		( new ElementorSettings() )->register();
		( new ElementorUserMeta() )->register();
	}
}

<?php
namespace Elementor\Modules\NotificationCenter;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'notification-center';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'admin_enqueue_scripts', function() {
			wp_enqueue_script( 'e-notification-center', $this->get_js_assets_url( 'notification-center' ), [
				'elementor-v2-ui',
				'elementor-v2-icons',
				'wp-i18n',
			], ELEMENTOR_VERSION, true );
		}, 5 /* Above Elementor's admin enqueue scripts */ );
	}
}

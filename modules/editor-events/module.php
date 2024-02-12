<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Tracker;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'editor-events';
	}

	public static function get_editor_events_config() {
		$can_send_events = Tracker::is_allow_track() && defined( 'ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL' );

		$settings = [
			'can_send_events' => $can_send_events,
			'elementor_version' => ELEMENTOR_VERSION,
			'site_url' => get_site_url(),
			'wp_version' => get_bloginfo( 'version' ),
			'user_agent' => esc_html( Utils::get_super_global_value( $_SERVER, 'HTTP_USER_AGENT' ) ),
			'site_language' => get_locale(),
			'site_key' => get_option( Base_App::OPTION_CONNECT_SITE_KEY ),
			'subscription_id' => null,
		];

		if ( $can_send_events ) {
			$settings['data_system_url'] = ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL;
		}

		return $settings;
	}
}

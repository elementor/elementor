<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Tracker;

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
		];

		if ( $can_send_events ) {
			$settings['data_system_url'] = ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL;
		}

		return $settings;
	}
}

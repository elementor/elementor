<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Tracker;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/editor/localize_settings', function( array $settings ) {
			return $this->admin_localize_settings( $settings );
		} );
	}

	public function get_name() {
		return 'editor-events';
	}

	private function admin_localize_settings( $settings ) {
		$can_send_events = $this->can_send_events();

		$additional_settings = [
			'editor_events' => [
				'can_send_events' => $can_send_events,
			],
		];

		if ( $can_send_events ) {
			$additional_settings['editor_events']['data_system_url'] = ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL;
		}

		return array_replace_recursive( $settings, $additional_settings );
	}

	private function can_send_events() {
		return Tracker::is_allow_track() && defined( 'ELEMENTOR_EDITOR_EVENTS_DATA_SYSTEM_URL' );
	}
}

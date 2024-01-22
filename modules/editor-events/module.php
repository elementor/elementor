<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;

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
		$additional_settings = [
			'editor_events' => [
				'can_send_events' => $this->can_send_events(),
				'target' => defined( 'ELEMENTOR_EDITOR_EVENTS_TARGET' ) ? ELEMENTOR_EDITOR_EVENTS_TARGET : '',
			],
		];

		return array_replace_recursive( $settings, $additional_settings );
	}

	private function can_send_events() {
		return true;
	}
}

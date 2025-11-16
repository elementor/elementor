<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Action_Link_Support {

	protected function get_action_based_dynamic_tags(): array {
		return [ 'popup', 'off-canvas', 'lightbox' ];
	}

	protected function has_action_in_link(): bool {
		$raw_settings = $this->get_settings();
		$link = $raw_settings['link'] ?? null;

		if ( ! is_array( $link ) || ! isset( $link['value']['destination'] ) ) {
			return false;
		}

		$destination = $link['value']['destination'];

		if ( ! isset( $destination['$$type'] ) || $destination['$$type'] !== 'dynamic' ) {
			return false;
		}

		$dynamic_tag_name = $destination['value']['name'] ?? '';
		$dynamic_tag_settings = $destination['value']['settings'] ?? [];

		if ( isset( $dynamic_tag_settings['action'] ) ) {
			return true;
		}

		return in_array( $dynamic_tag_name, $this->get_action_based_dynamic_tags(), true );
	}

	public function get_script_depends() {
		return [ 'elementor-atomic-action-buttons' ];
	}

	public function register_frontend_handlers() {
		$min_suffix = ( \Elementor\Utils::is_script_debug() || \Elementor\Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-atomic-action-buttons',
			ELEMENTOR_URL . 'modules/atomic-widgets/assets/js/atomic-action-buttons-handler' . $min_suffix . '.js',
			[ 'elementor-frontend' ],
			ELEMENTOR_VERSION,
			true
		);
	}
}


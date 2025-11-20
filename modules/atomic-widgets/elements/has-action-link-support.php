<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Action_Link_Support {

	protected function has_action_in_link(): bool {
		$atomic_settings = $this->get_atomic_settings();
		$link = $atomic_settings['link'] ?? null;

		if ( ! is_array( $link ) ) {
			return false;
		}

		$tag_group = $link['data-dynamic-tag-group'] ?? '';

		return 'action' === $tag_group;
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

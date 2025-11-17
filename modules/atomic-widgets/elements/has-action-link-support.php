<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Action_Link_Support {

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

		if ( ! $dynamic_tag_name ) {
			return false;
		}

		$tag_info = Plugin::$instance->dynamic_tags->get_tag_info( $dynamic_tag_name );

		if ( ! $tag_info || ! isset( $tag_info['instance'] ) ) {
			return false;
		}

		$tag_instance = $tag_info['instance'];

		if ( ! method_exists( $tag_instance, 'get_group' ) ) {
			return false;
		}

		$tag_group = $tag_instance->get_group();

		if ( $dynamic_tag_name === 'contact-url' && $tag_group === 'action' ) {
			return false;
		}

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


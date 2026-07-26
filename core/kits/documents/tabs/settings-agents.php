<?php

namespace Elementor\Core\Kits\Documents\Tabs;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Settings_Agents extends Tab_Base {

	public function get_id() {
		return 'settings-agents';
	}

	public function get_title() {
		return esc_html__( 'Agents', 'elementor' );
	}

	public function get_group() {
		return 'agents';
	}

	public function get_icon() {
		return 'eicon-ai';
	}

	public function before_save( array $data ) {
		if ( empty( $data['settings'] ) || ! isset( $data['settings']['agents_llms'] ) ) {
			return $data;
		}

		$llms = is_string( $data['settings']['agents_llms'] )
			? sanitize_textarea_field( $data['settings']['agents_llms'] )
			: '';

		unset( $data['settings']['agents_llms'] );

		if ( '' !== $llms ) {
			$data['settings']['agents'] = [
				'llms' => $llms,
			];
		} else {
			unset( $data['settings']['agents'] );
		}

		return $data;
	}

	protected function register_tab_controls() {}
}

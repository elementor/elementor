<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;

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

	public function register_controls() {
		$this->flatten_agents_settings_for_controls();

		parent::register_controls();
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

	protected function register_tab_controls() {
		$this->start_controls_section(
			'section_' . $this->get_id(),
			[
				'label' => esc_html__( 'Agents', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$this->add_control(
			'agents_llms',
			[
				'label' => esc_html__( 'llms.txt', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'description' => esc_html__( 'Content served at /llms.txt when saved. Leave empty to disable.', 'elementor' ),
				'rows' => 12,
				'label_block' => true,
			]
		);

		$this->end_controls_section();
	}

	private function flatten_agents_settings_for_controls(): void {
		$settings = $this->parent->get_settings();

		if (
			! is_array( $settings['agents'] ?? null )
			|| ! isset( $settings['agents']['llms'] )
			|| isset( $settings['agents_llms'] )
		) {
			return;
		}

		$this->parent->set_settings( 'agents_llms', $settings['agents']['llms'] );
	}
}

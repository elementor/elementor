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
		if ( empty( $data['settings'] ) ) {
			return $data;
		}

		$llms = $this->extract_llms_from_settings( $data['settings'] );

		if ( null === $llms ) {
			return $data;
		}

		unset( $data['settings']['agents_llms'] );

		$agents = is_array( $data['settings']['agents'] ?? null ) ? $data['settings']['agents'] : [];

		if ( '' !== $llms ) {
			$agents['llms'] = $llms;
			$data['settings']['agents'] = $agents;
		} else {
			unset( $agents['llms'] );

			if ( empty( $agents ) ) {
				unset( $data['settings']['agents'] );
			} else {
				$data['settings']['agents'] = $agents;
			}
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

	/**
	 * @param array $settings
	 *
	 * @return string|null Sanitized llms content, or null when llms was not in the payload.
	 */
	private function extract_llms_from_settings( array $settings ): ?string {
		if ( isset( $settings['agents_llms'] ) ) {
			return is_string( $settings['agents_llms'] )
				? sanitize_textarea_field( $settings['agents_llms'] )
				: '';
		}

		if ( ! isset( $settings['agents']['llms'] ) ) {
			return null;
		}

		return is_string( $settings['agents']['llms'] )
			? sanitize_textarea_field( $settings['agents']['llms'] )
			: '';
	}
}

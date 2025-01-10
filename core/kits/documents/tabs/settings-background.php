<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Group_Control_Background;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Background extends Tab_Base {

	public function get_id() {
		return 'settings-background';
	}

	public function get_title() {
		return esc_html__( 'Background', 'elementor' );
	}

	public function get_group() {
		return 'settings';
	}

	public function get_icon() {
		return 'eicon-background';
	}

	public function get_help_url() {
		return 'https://go.elementor.com/global-background/';
	}

	protected function register_tab_controls() {
		$this->start_controls_section(
			'section_background',
			array(
				'label' => $this->get_title(),
				'tab' => $this->get_id(),
			)
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			array(
				'name' => 'body_background',
				'types' => array( 'classic', 'gradient' ),
				'selector' => '{{WRAPPER}}',
				'fields_options' => array(
					'background' => array(
						'frontend_available' => true,
					),
					'color' => array(
						'dynamic' => array(),
					),
					'color_b' => array(
						'dynamic' => array(),
					),
				),
			)
		);

		$this->add_control(
			'mobile_browser_background',
			array(
				'label' => esc_html__( 'Mobile Browser Background', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'description' => esc_html__( 'The `theme-color` meta tag will only be available in supported browsers and devices.', 'elementor' ),
				'separator' => 'before',
			)
		);

		$this->add_control(
			'body_overscroll_behavior',
			array(
				'label' => esc_html__( 'Overscroll Behavior', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'none' => esc_html__( 'None', 'elementor' ),
					'auto' => esc_html__( 'Auto', 'elementor' ),
					'contain' => esc_html__( 'Contain', 'elementor' ),
				),
				'separator' => 'before',
				'selectors' => array(
					'{{WRAPPER}}' => 'overscroll-behavior: {{VALUE}};',
				),
			)
		);

		$this->end_controls_section();
	}
}

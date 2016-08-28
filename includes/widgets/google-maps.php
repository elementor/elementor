<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Google_maps extends Widget_Base {

	public function get_id() {
		return 'google_maps';
	}

	public function get_title() {
		return __( 'Google Maps', 'elementor' );
	}

	public function get_icon() {
		return 'google-maps';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_map',
			[
				'label' => __( 'Map', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$default_address = __( 'London Eye, London, United Kingdom', 'elementor' );
		$this->add_control(
			'address',
			[
				'label' => __( 'Address', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'placeholder' => $default_address,
				'default' => $default_address,
				'label_block' => true,
				'section' => 'section_map',
			]
		);

		$this->add_control(
			'zoom',
			[
				'label' => __( 'Zoom Level', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 10,
				],
				'range' => [
					'px' => [
						'min' => 1,
						'max' => 20,
					],
				],
				'section' => 'section_map',
			]
		);

		$this->add_control(
			'height',
			[
				'label' => __( 'Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 300,
				],
				'range' => [
					'px' => [
						'min' => 40,
						'max' => 1440,
					],
				],
				'section' => 'section_map',
				'selectors' => [
					'{{WRAPPER}} iframe' => 'height: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'prevent_scroll',
			[
				'label' => __( 'Prevent Scroll', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
				'section' => 'section_map',
				'selectors' => [
					'{{WRAPPER}} iframe' => 'pointer-events: none;',
				],
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_map',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['address'] ) )
			return;

		if ( 0 === absint( $instance['zoom']['size'] ) )
			$instance['zoom']['size'] = 10;

		printf(
			'<div class="elementor-custom-embed"><iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=%s&amp;t=m&amp;z=%d&amp;output=embed&amp;iwloc=near"></iframe></div>',
			urlencode( $instance['address'] ),
			absint( $instance['zoom']['size'] )
		);
	}

	protected function content_template() {}
}

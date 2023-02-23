<?php

namespace Elementor\Modules\DesignGuidelines\Widgets\Global_Colors;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Colors extends Widget_Base {

	public function get_name() {
		return 'global-colors';
	}

	public function get_title() {
		return esc_html__( 'Global Colors', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-sidebar'; // todo
	}

	public function get_keywords() {
		return [ 'global-settings', 'design' ];
	}

	protected function register_controls() {
		$this->start_controls_section(
			'global_colors',
			[
				'label' => esc_html__( 'Global Colors', 'elementor' ),
			]
		);

		$this->add_control(
			'source',
			[
				'label' => esc_html__( 'Source', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'system',
				'options' => [
					'system' => esc_html__( 'System', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'color_width',
			[
				'label' => esc_html__( 'Color Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', '%', 'em' ],
				'range' => [
					'px' => [
						'max' => 20, // todo
					],
					'em' => [
						'max' => 2,
					],
				],
			]
		);

		$this->end_controls_section();
	}

	protected function render() {

	}
}

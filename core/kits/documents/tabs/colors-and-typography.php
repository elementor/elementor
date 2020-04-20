<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Colors_And_Typography extends Tab_Base {

	protected function get_id() {
		return 'colors-and-typography';
	}

	protected function get_title() {
		return __( 'Colors & Typography', 'elementor' );
	}

	public function register_tab_controls() {
		$this->start_controls_section(
			'section_global_colors',
			[
				'label' => __( 'Global Colors', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
			]
		);

		$repeater->add_control(
			'color',
			[
				'type' => Controls_Manager::COLOR,
				'dynamic' => [],
			]
		);

		$global_colors = [
			[
				'title' => __( 'Primary', 'elementor' ),
				'color' => '#00f',
			],
			[
				'title' => __( 'Secondary', 'elementor' ),
				'color' => '#f00',
			],
		];

		$this->add_control(
			'colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
				'default' => $global_colors,
			]
		);

		$this->end_controls_section();
	}
}

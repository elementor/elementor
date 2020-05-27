<?php

namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Controls\Repeater as Global_Style_Repeater;
use Elementor\Group_Control_Typography;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Global_Style extends Tab_Base {

	const COLOR_PRIMARY = 'globals/colors/primary';
	const COLOR_SECONDARY = 'globals/colors/secondary';
	const COLOR_TEXT = 'globals/colors/text';
	const COLOR_ACCENT = 'globals/colors/accent';

	const TYPOGRAPHY_PRIMARY = 'globals/typography/primary';
	const TYPOGRAPHY_SECONDARY = 'globals/typography/secondary';
	const TYPOGRAPHY_TEXT = 'globals/typography/text';
	const TYPOGRAPHY_ACCENT = 'globals/typography/accent';

	public function get_id() {
		return 'global-style';
	}

	public function get_title() {
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
				'label_block' => true,
			]
		);

		$repeater->add_control(
			'color',
			[
				'type' => Controls_Manager::COLOR,
				'label_block' => true,
				'dynamic' => [],
			]
		);

		$this->add_control(
			'colors',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_text_style',
			[
				'label' => __( 'Global Text Styles', 'elementor' ),
				'tab' => $this->get_id(),
			]
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'title',
			[
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
			]
		);

		$repeater->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'styles',
			]
		);

		$this->add_control(
			'text_styles',
			[
				'type' => Global_Style_Repeater::CONTROL_TYPE,
				'fields' => $repeater->get_controls(),
			]
		);

		$this->end_controls_section();
	}
}

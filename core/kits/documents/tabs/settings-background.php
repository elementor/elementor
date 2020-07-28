<?php
namespace Elementor\Core\Kits\Documents\Tabs;

use Elementor\Group_Control_Background;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Settings_Background extends Tab_Base {

	public function get_id() {
		return 'settings-background';
	}

	public function get_title() {
		return __( 'Background', 'elementor' );
	}

	protected function register_tab_controls() {
		$this->start_controls_section(
			'section_background',
			[
				'label' => $this->get_title(),
				'tab' => $this->get_id(),
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'body_background',
				'types' => [ 'classic', 'gradient' ],
				'selector' => '{{WRAPPER}}',
				'fields_options' => [
					'background' => [
						'frontend_available' => true,
					],
					'color' => [
						'dynamic' => [],
					],
					'color_b' => [
						'dynamic' => [],
					],
				],
			]
		);

		$this->end_controls_section();
	}
}

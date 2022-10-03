<?php

namespace Elementor\Testing\Modules\KitElementsDefaults\Mock;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

class Mock_Widget extends Widget_Base {

	public function get_name() {
		return 'mock-widget';
	}

	protected function register_controls() {
		$this->start_controls_section( 'section', [] );

		$this->add_control(
			'secret_control',
			[
				'type' => Controls_Manager::TEXT,
			]
		);

		$this->add_control(
			'regular_control',
			[
				'type' => Controls_Manager::TEXT,
			]
		);

		$this->end_controls_section();
	}

	public function on_export( $element_data ) {
		unset( $element_data['settings']['secret_control'] );

		return $element_data;
	}
}

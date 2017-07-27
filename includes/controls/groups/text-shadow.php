<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Group_Control_Text_Shadow extends Group_Control_Base {

	protected static $fields;

	public static function get_type() {
		return 'text-shadow';
	}

	protected function init_fields() {
		$controls = [];

		$controls['text_shadow_type'] = [
			'label' => _x( 'Text Shadow', 'Text Shadow Control', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'return_value' => 'yes',
			'render_type' => 'ui',
		];

		$controls['text_shadow'] = [
			'label' => _x( 'Text Shadow', 'Text Shadow Control', 'elementor' ),
			'type' => Controls_Manager::TEXT_SHADOW,
			'condition' => [
				'text_shadow_type!' => '',
			],
			'selectors' => [
				'{{SELECTOR}}' => 'text-shadow: {{HORIZONTAL}}px {{VERTICAL}}px {{BLUR}}px {{COLOR}};',
			],
		];

		return $controls;
	}
}

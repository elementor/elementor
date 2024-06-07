<?php

namespace Elementor\Modules\ConversionCenter\Controls;

use Elementor\Control_Hover_Animation;

class Hover_Animation_Contact_Buttons extends Control_Hover_Animation {

	const TYPE = 'hover_animation_contact_buttons';

	public function get_type() {
		return static::TYPE;
	}

	public static function get_animations() {
		return [
			'grow' => 'Grow',
			'pulse' => 'Pulse',
			'push' => 'Push',
			'float' => 'Float',
		];
	}
}

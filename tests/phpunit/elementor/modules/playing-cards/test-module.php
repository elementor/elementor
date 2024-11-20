<?php

namespace Elementor\Modules\PlayingCards\Tests;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\PlayingCards\Widgets\Playing_Cards;

class Test_PlayingCards_Module extends Elementor_Test_Base {
	public function test_styles_registered() {
		$module = new \Elementor\Modules\PlayingCards\Module();
		$module->register_styles();
		$this->assertTrue(wp_style_is('widget-playing-cards', 'registered'));
	}
}

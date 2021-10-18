<?php

namespace Elementor\Testing\Modules\Favorites\Types;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Favorites\Types\Widgets;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Widgets extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'heading', 'image', 'button', 'not-really-a-widget' ];

	public function test_should_get_name() {
		$module = new Widgets();

		$this->assertEquals( 'widgets', $module->get_name() );
	}

	public function test_prepare() {
		$module = new Widgets();
		$unavailable_widget_index = 'not-really-a-widget';

		$this->assertEquals(
			array_diff( static::FAVORITES_DATA, [ $unavailable_widget_index ] ),
			$module->prepare( static::FAVORITES_DATA )
		);
	}
}

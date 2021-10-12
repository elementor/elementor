<?php

namespace Elementor\Testing\Modules\Favorites\Types;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Favorites\Types\Widgets;
use Elementor\Testing\Elementor_Test_Base;

class Test_Widgets extends Elementor_Test_Base {

	const FAVORITES_DATA = [ 'heading', 'image', 'not-really-a-widget' ];

	public function test_should_get_name() {
		$module = new Widgets();

		$this->assertEquals( $module->get_name(), 'widgets' );
	}

	public function test_prepare() {
		$module = new Widgets();
		$unavailable_widget_index = 'not-really-a-widget';

		$this->assertEquals(
			$module->prepare( static::FAVORITES_DATA ),
			array_diff( static::FAVORITES_DATA, [ $unavailable_widget_index ] )
		);
	}
}

<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Menu_Anchor extends Elementor_Test_Base {
	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [ 'anchor' => 'test-anchor' ],
		'widgetType' => 'menu-anchor',
	];

	public function test_on_save__with_invalid_data() {
		// Arrange.
		$mock = static::MOCK;
		$mock['settings']['anchor'] = 'invalid<data> onclick="alert()"';
		$element = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act. (trigger the `on_save`)
		$data = $element->get_data_for_save();

		// Assert.
		$this->assertEquals( [
			'id' => 'e8e55a1',
			'elType' => 'widget',
			'settings' => [ 'anchor' => 'invaliddataonclickalert' ],
			'widgetType' => 'menu-anchor',
			'elements' => [],
		], $data );
	}
}

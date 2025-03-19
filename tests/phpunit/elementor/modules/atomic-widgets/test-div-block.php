<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Div_Block extends Elementor_Test_Base {
	use MatchesSnapshots;

	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'div-block',
		'settings' => [],
		'widgetType' => 'div-block',
	];

	const MOCK_LINK = [
		'id' => 'e8e55a1',
		'elType' => 'div-block',
		'settings' => [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
			],
		],
		'widgetType' => 'div-block',
	];

	const MOCK_CHILD = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [],
		'widgetType' => 'a-paragraph',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
	}

	public function test__render_div_block(): void {
		// Arrange.
		$this->instance->add_child(self::MOCK_CHILD);

		// Act.
		ob_start();
		$this->instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_div_block_with_link_control(): void {
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_LINK );
		$widget_instance->add_child(self::MOCK_CHILD);

		// Act.
		ob_start();
		$widget_instance->print_element();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

}

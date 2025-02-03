<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Paragraph extends Elementor_Test_Base {
	use MatchesSnapshots;
	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [],
		'widgetType' => 'a-paragraph',
	];

	const MOCK_LINK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [
			'link' => [
				'href' => 'https://example.com',
				'target' => '_blank',
			],
		],
		'widgetType' => 'a-paragraph',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
	}

	public function test__render_paragraph(): void {
		// Act.
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test__render_linked_paragraph()
	{
		// Arrange.
		$widget_instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK_LINK );

		// Act.
		ob_start();
		$widget_instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}

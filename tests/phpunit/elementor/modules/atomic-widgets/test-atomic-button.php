<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_Atomic_Button extends Elementor_Test_Base {
	use MatchesSnapshots;
	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [],
		'widgetType' => 'a-button',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
	}

	public function test__render_button(): void {
		// Act.
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}

<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Elementor_Tests_Elementor_Modules_AtomicWidgets_TestAtomicParagraph extends Elementor_Test_Base {
	use MatchesSnapshots;
	const MOCK = [
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

	public function test_get_paragraph_widget_name(): void {
		$this->assertSame( 'a-paragraph', $this->instance->get_name() );
	}

	public function test_get_paragraph_widget_icon(): void {
		$this->assertSame( 'eicon-text', $this->instance->get_icon() );
	}

	public function test_paragraph_render(): void {
		// Act.
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}

	public function test_set_paragraph_value(): void {
		// Arrange.
		$this->instance->set_settings( [ 'paragraph' => 'Hello' ] );

		// Act.
		ob_start();
		$this->instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}

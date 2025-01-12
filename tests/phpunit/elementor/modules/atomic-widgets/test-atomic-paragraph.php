<?php

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Tests_Elementor_Modules_AtomicWidgets_TestAtomicParagraph extends Elementor_Test_Base {
	const MOCK = [
		'id' => 'e8e55a1',
		'elType' => 'widget',
		'settings' => [],
		'widgetType' => 'a-paragraph',
	];

	protected $instance;

	public function setUp(): void {
		parent::setUp();

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK);
	}

	public function test_get_paragraph_widget_name(): void {
		$this->assertSame( 'a-paragraph', $this->instance->get_name() );
	}

	public function test_get_paragraph_widget_icon(): void {
		var_dump($this->instance->get_icon());
		$this->assertSame( 'eicon-text', $this->instance->get_icon() );
	}

	public function test_paragraph_render(): void {
		// Arrange.
		$expected = '<p >Type your paragraph here</p>';

		// Act.
		ob_start();
		$this->instance->render_content();
		$actual = ob_get_clean();

		// Assert.
		$this->assertSame( $this->widgetStringOutput( $expected ), $this->widgetStringOutput( $actual ) );
	}

	public function test_set_paragraph_value(): void {
		// Arrange.
		$expected = '<p >Hello</p>';
		$this->instance->set_settings( [ 'paragraph' => 'Hello' ] );

		// Act.
		ob_start();
		$this->instance->render_content();
		$actual = ob_get_clean();

		// Assert.
		$this->assertEq( $this->widgetStringOutput( $expected ), $this->widgetStringOutput( $actual ) );
	}


	public function widgetStringOutput( string $string ): void {
		ob_start();
		echo $string;
		echo ob_get_clean();
	}
}

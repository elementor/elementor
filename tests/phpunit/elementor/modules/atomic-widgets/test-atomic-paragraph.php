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

		$this->instance = Plugin::$instance->elements_manager->create_element_instance( self::MOCK );
	}

	public function test_get_paragraph_widget_name(): void {
		$this->assertSame( 'a-paragraph', $this->instance->get_name() );
	}

	public function test_get_paragraph_widget_icon(): void {
		$this->assertSame( 'eicon-text', $this->instance->get_icon() );
	}

	public function test_default_paragraph_value_render(): void {
	    // Arrange.
		$expected_tag = 'p';
		$expected_content = 'Type your paragraph here';

	    // Act.
	    ob_start();
	    $this->instance->render_content();
	    $actual = ob_get_clean();

		preg_match('/<\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>(.*?)<\/\s*\\1\s*>/s', $actual, $matches);
		$actual_tag = $matches[1] ?? null;
		$actual_content = $matches[2] ?? null;

		// Assert.
		$this->assertSame( $expected_tag, $actual_tag );
		$this->assertSame( $expected_content, $actual_content );
	}

	public function test_set_paragraph_value(): void {
		// Arrange.
		$new_content = 'Hello';
		$this->instance->set_settings( [ 'paragraph' => $new_content ] );
		$expected_tag = 'p';
		$expected_content = $new_content;

		// Act.
		ob_start();
		$this->instance->render_content();
		$actual = ob_get_clean();

		preg_match('/<\s*([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>(.*?)<\/\s*\\1\s*>/s', $actual, $matches);
		$actual_tag = $matches[1] ?? null;
		$actual_content = $matches[2] ?? null;

		// Assert.
		$this->assertSame( $expected_tag, $actual_tag );
		$this->assertSame( $expected_content, $actual_content );
	}
}

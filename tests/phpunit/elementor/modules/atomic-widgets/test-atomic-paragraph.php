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

	/**
	 * @dataProvider data_test_render_values
	 */
	public function test_render__paragraph( $default, $expected_content) {
	    // Arrange.
		if( ! $default ) {
			$this->instance->set_settings( [ 'paragraph' => $expected_content ] );
		}

		$expected_tag = 'p';

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

	public function data_test_render_values(): array {
		return [
			[ true, 'Type your paragraph here' ],
			[ false, 'New Text' ],
		];
	}
}

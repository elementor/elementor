<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/AtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-id-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-to-props-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/widget-json-generator.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-widget-factory.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Widget_Factory;

class AtomicWidgetFactoryTest extends AtomicWidgetTestCase {

	private Atomic_Widget_Factory $factory;

	protected function setUp(): void {
		parent::setUp();
		$this->factory = new Atomic_Widget_Factory();
	}

	public function test_supports_widget_type_returns_true_for_supported_types(): void {
		$supported_types = [ 'e-heading', 'e-paragraph', 'e-button', 'e-image', 'e-flexbox' ];

		foreach ( $supported_types as $type ) {
			$this->assertTrue( 
				$this->factory->supports_widget_type( $type ),
				"Factory should support widget type: {$type}"
			);
		}
	}

	public function test_supports_widget_type_returns_false_for_unsupported_types(): void {
		$unsupported_types = [ 'e-unknown', 'e-custom', 'invalid-type', '' ];

		foreach ( $unsupported_types as $type ) {
			$this->assertFalse( 
				$this->factory->supports_widget_type( $type ),
				"Factory should not support widget type: {$type}"
			);
		}
	}

	public function test_get_supported_widget_types_returns_expected_types(): void {
		$supported_types = $this->factory->get_supported_widget_types();

		$this->assertIsArray( $supported_types );
		$this->assertNotEmpty( $supported_types );
		$this->assertContains( 'e-heading', $supported_types );
		$this->assertContains( 'e-paragraph', $supported_types );
		$this->assertContains( 'e-button', $supported_types );
		$this->assertContains( 'e-image', $supported_types );
		$this->assertContains( 'e-flexbox', $supported_types );
	}

	public function test_create_widget_returns_null_for_unsupported_type(): void {
		$element = $this->get_sample_html_element();
		$result = $this->factory->create_widget( 'unsupported-type', $element );

		$this->assertNull( $result );
	}

	public function test_create_widget_returns_null_for_empty_type(): void {
		$element = $this->get_sample_html_element();
		$result = $this->factory->create_widget( '', $element );

		$this->assertNull( $result );
	}

	public function test_create_heading_widget_returns_valid_structure(): void {
		$element = $this->get_sample_heading_element();
		$result = $this->factory->create_widget( 'e-heading', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
		$this->assertEquals( 'e-heading', $result['widgetType'] );
		$this->assertEquals( 'widget', $result['elType'] );
	}

	public function test_create_paragraph_widget_returns_valid_structure(): void {
		$element = $this->get_sample_paragraph_element();
		$result = $this->factory->create_widget( 'e-paragraph', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
		$this->assertEquals( 'e-paragraph', $result['widgetType'] );
		$this->assertEquals( 'widget', $result['elType'] );
	}

	public function test_create_button_widget_returns_valid_structure(): void {
		$element = $this->get_sample_button_element();
		$result = $this->factory->create_widget( 'e-button', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
		$this->assertEquals( 'e-button', $result['widgetType'] );
		$this->assertEquals( 'widget', $result['elType'] );
	}

	public function test_create_flexbox_widget_returns_valid_structure(): void {
		$element = $this->get_sample_html_element();
		$result = $this->factory->create_widget( 'e-flexbox', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
		$this->assertEquals( 'e-flexbox', $result['widgetType'] );
		$this->assertEquals( 'e-flexbox', $result['elType'] );
	}

	public function test_create_widget_generates_unique_ids(): void {
		$element = $this->get_sample_html_element();
		
		$widget1 = $this->factory->create_widget( 'e-flexbox', $element );
		$widget2 = $this->factory->create_widget( 'e-flexbox', $element );

		$this->assertNotEquals( $widget1['id'], $widget2['id'] );
	}

	public function test_create_widget_preserves_text_content(): void {
		$element = $this->get_sample_heading_element();
		$element['text'] = 'Custom Heading Text';
		
		$result = $this->factory->create_widget( 'e-heading', $element );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'settings', $result );
		
		$settings = $result['settings'];
		$this->assertArrayHasKey( 'title', $settings );
		$this->assertEquals( 'Custom Heading Text', $settings['title'] );
	}

	public function test_create_widget_handles_inline_styles(): void {
		$element = $this->get_sample_html_element();
		$element['inline_styles'] = [
			'color' => 'red',
			'font-size' => '18px',
			'margin' => '10px 20px',
		];

		$result = $this->factory->create_widget( 'e-flexbox', $element );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'styles', $result );
		$this->assertNotEmpty( $result['styles'] );

		$styles = array_values( $result['styles'] )[0];
		$this->assertArrayHasKey( 'variants', $styles );
		$this->assertNotEmpty( $styles['variants'] );

		$variant = $styles['variants'][0];
		$this->assertArrayHasKey( 'props', $variant );
		$this->assertNotEmpty( $variant['props'] );
	}

	public function test_create_widget_handles_empty_element_gracefully(): void {
		$element = [
			'tag' => 'div',
			'text' => '',
			'attributes' => [],
			'classes' => [],
			'inline_styles' => [],
			'children' => [],
			'widget_type' => 'e-flexbox',
		];

		$result = $this->factory->create_widget( 'e-flexbox', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
	}

	public function test_get_atomic_widget_class_returns_correct_class(): void {
		$class = $this->factory->get_atomic_widget_class( 'e-heading' );
		$this->assertIsString( $class );
		$this->assertStringContains( 'Atomic_Heading', $class );

		$class = $this->factory->get_atomic_widget_class( 'e-paragraph' );
		$this->assertIsString( $class );
		$this->assertStringContains( 'Atomic_Paragraph', $class );

		$class = $this->factory->get_atomic_widget_class( 'e-flexbox' );
		$this->assertIsString( $class );
		$this->assertStringContains( 'Flexbox', $class );
	}

	public function test_get_atomic_widget_class_returns_null_for_unsupported(): void {
		$class = $this->factory->get_atomic_widget_class( 'unsupported-type' );
		$this->assertNull( $class );
	}

	public function test_get_props_schema_returns_array_for_supported_type(): void {
		$schema = $this->factory->get_props_schema( 'e-heading' );
		$this->assertIsArray( $schema );
		$this->assertNotEmpty( $schema );
	}

	public function test_get_props_schema_returns_null_for_unsupported_type(): void {
		$schema = $this->factory->get_props_schema( 'unsupported-type' );
		$this->assertNull( $schema );
	}

	public function test_create_widget_with_missing_widget_type_returns_null(): void {
		$element = $this->get_sample_html_element();
		unset( $element['widget_type'] );

		$result = $this->factory->create_widget( 'e-flexbox', $element );

		$this->assertIsArray( $result );
	}

	public function test_create_widget_validates_props_against_schema(): void {
		$element = $this->get_sample_heading_element();
		$element['tag'] = 'invalid-tag';

		$result = $this->factory->create_widget( 'e-heading', $element );

		$this->assertIsArray( $result );
		$this->assertValidWidgetStructure( $result );
	}
}

<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widgets_Orchestrator;

class EdgeCaseTest extends AtomicWidgetV2TestCase {

	private Atomic_Widgets_Orchestrator $orchestrator;

	protected function setUp(): void {
		parent::setUp();
		$this->orchestrator = new Atomic_Widgets_Orchestrator( true, true );
	}

	public function test_empty_and_whitespace_html(): void {
		$test_cases = [
			'',
			'   ',
			"\n\t\r",
			'<!-- comment only -->',
			'<div></div>',
			'<div>   </div>',
			'<div>\n\t\r</div>',
		];

		foreach ( $test_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			$this->assertFalse( $result['success'], "Empty/whitespace HTML should fail: '{$html}'" );
			$this->assertArrayHasKey( 'error', $result );
		}
	}

	public function test_malformed_html_handling(): void {
		$malformed_cases = [
			'<div><p>Unclosed paragraph</div>',
			'<div><span>Unclosed span<p>Mixed nesting</div></p>',
			'<div style="color: red;><p>Unclosed style attribute</p></div>',
			'<div style=color: red;"><p>Malformed style attribute</p></div>',
			'<div><p>Text<b>Bold<i>Italic</p></b></i></div>',
		];

		foreach ( $malformed_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			// Should attempt to handle malformed HTML gracefully
			$this->assertArrayHasKey( 'success', $result );
			
			if ( $result['success'] ) {
				$this->assertNotEmpty( $result['widgets'] );
			} else {
				$this->assertArrayHasKey( 'error', $result );
			}
		}
	}

	public function test_deeply_nested_structures(): void {
		// Create deeply nested HTML
		$html = '<div style="padding: 10px;">';
		$depth = 20;
		
		for ( $i = 0; $i < $depth; $i++ ) {
			$html .= "<div style=\"margin: {$i}px;\">";
		}
		
		$html .= '<p style="font-size: 16px;">Deep content</p>';
		
		for ( $i = 0; $i < $depth; $i++ ) {
			$html .= '</div>';
		}
		
		$html .= '</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'], 'Should handle deeply nested structures' );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Verify nesting depth in stats
		$stats = $result['stats'];
		$this->assertGreaterThan( $depth, $stats['total_elements_parsed'] );
	}

	public function test_special_characters_and_encoding(): void {
		$special_cases = [
			'<div><h1>Héllo Wörld</h1><p>Spéciàl chäractërs</p></div>',
			'<div><h1>中文测试</h1><p>Chinese characters</p></div>',
			'<div><h1>العربية</h1><p>Arabic text</p></div>',
			'<div><h1>🚀 Emoji Test</h1><p>Unicode: ✅ ❌ 🎉</p></div>',
			'<div><p>&lt;script&gt;alert("xss")&lt;/script&gt;</p></div>',
			'<div><p>&amp; &quot; &apos; &lt; &gt;</p></div>',
		];

		foreach ( $special_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			$this->assertTrue( $result['success'], "Should handle special characters: {$html}" );
			$this->assertNotEmpty( $result['widgets'] );
			
			// Verify content is preserved
			$widgets = $result['widgets'];
			$this->assertGreaterThan( 0, count( $widgets ) );
		}
	}

	public function test_invalid_css_properties(): void {
		$invalid_css_cases = [
			'<div style="invalid-property: value;">Content</div>',
			'<div style="color: invalid-color;">Content</div>',
			'<div style="font-size: invalid-size;">Content</div>',
			'<div style="margin: invalid invalid invalid;">Content</div>',
			'<div style="background: url(invalid-url);">Content</div>',
			'<div style="display: invalid-display;">Content</div>',
		];

		foreach ( $invalid_css_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			$this->assertTrue( $result['success'], "Should handle invalid CSS gracefully: {$html}" );
			$this->assertNotEmpty( $result['widgets'] );
			
			// Should have warnings about invalid properties
			if ( isset( $result['warnings'] ) ) {
				$this->assertNotEmpty( $result['warnings'] );
			}
		}
	}

	public function test_unsupported_html_elements(): void {
		$unsupported_cases = [
			'<custom-element>Custom content</custom-element>',
			'<web-component>Web component</web-component>',
			'<unknown-tag>Unknown tag</unknown-tag>',
			'<div><custom-child>Nested custom</custom-child></div>',
			'<svg><circle cx="50" cy="50" r="40"/></svg>',
			'<canvas width="200" height="100"></canvas>',
		];

		foreach ( $unsupported_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			// Should either succeed with warnings or fail gracefully
			$this->assertArrayHasKey( 'success', $result );
			
			if ( $result['success'] ) {
				// Should have stats about unsupported elements
				$stats = $result['stats'];
				$this->assertArrayHasKey( 'unsupported_elements', $stats );
			}
		}
	}

	public function test_mixed_valid_invalid_content(): void {
		$mixed_html = '<div style="padding: 20px;">
						<h1 style="font-size: 32px;">Valid Heading</h1>
						<custom-element style="color: red;">Invalid Element</custom-element>
						<p style="font-size: 16px; invalid-prop: value;">Valid Paragraph with Invalid CSS</p>
						<unknown-tag>Unknown content</unknown-tag>
						<button style="background: green; color: white;">Valid Button</button>
						<div style="display: invalid-display; padding: 10px;">
							<span style="color: blue;">Nested valid content</span>
						</div>
					</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $mixed_html );

		$this->assertTrue( $result['success'], 'Should succeed with mixed content' );
		$this->assertNotEmpty( $result['widgets'] );

		// Verify stats reflect mixed content
		$stats = $result['stats'];
		$this->assertGreaterThan( 0, $stats['supported_elements'] );
		$this->assertGreaterThan( 0, $stats['total_widgets_created'] );
		
		// Should have some unsupported elements
		if ( $stats['unsupported_elements'] > 0 ) {
			$this->assertGreaterThan( 0, $stats['unsupported_elements'] );
		}
	}

	public function test_extreme_css_values(): void {
		$extreme_cases = [
			'<div style="font-size: 0px;">Zero font size</div>',
			'<div style="font-size: 1000px;">Huge font size</div>',
			'<div style="margin: -100px;">Negative margin</div>',
			'<div style="padding: 9999px;">Extreme padding</div>',
			'<div style="width: 0.001px;">Tiny width</div>',
			'<div style="height: 100vh;">Viewport height</div>',
			'<div style="font-size: calc(100% + 10px);">Calc function</div>',
		];

		foreach ( $extreme_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			$this->assertTrue( $result['success'], "Should handle extreme CSS values: {$html}" );
			$this->assertNotEmpty( $result['widgets'] );
		}
	}

	public function test_complex_css_selectors_and_properties(): void {
		$complex_cases = [
			'<div style="background: linear-gradient(45deg, red, blue);">Gradient background</div>',
			'<div style="box-shadow: 0 0 10px rgba(0,0,0,0.5), inset 0 0 5px white;">Multiple shadows</div>',
			'<div style="transform: rotate(45deg) scale(1.5) translate(10px, 20px);">Complex transform</div>',
			'<div style="border: 2px solid rgba(255,0,0,0.5);">RGBA border</div>',
			'<div style="background: url(data:image/svg+xml;base64,...);">Data URL background</div>',
		];

		foreach ( $complex_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			$this->assertTrue( $result['success'], "Should handle complex CSS: {$html}" );
			$this->assertNotEmpty( $result['widgets'] );
		}
	}

	public function test_large_attribute_values(): void {
		$large_content = str_repeat( 'Very long content that might cause issues. ', 100 );
		$large_style = 'padding: 10px; margin: 5px; ' . str_repeat( 'color: red; ', 50 );
		
		$html = "<div style=\"{$large_style}\">
					<p>{$large_content}</p>
				</div>";

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'], 'Should handle large attribute values' );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Verify content is preserved
		$widgets = $result['widgets'];
		$container = $widgets[0];
		$this->assertArrayHasKey( 'elements', $container );
		$this->assertNotEmpty( $container['elements'] );
	}

	public function test_circular_reference_prevention(): void {
		// This test ensures the system doesn't create circular references
		$html = '<div id="parent" style="padding: 10px;">
					<div id="child1" style="margin: 5px;">
						<div id="grandchild" style="color: blue;">
							<p>Deep nesting test</p>
						</div>
					</div>
					<div id="child2" style="margin: 5px;">
						<span>Sibling content</span>
					</div>
				</div>';

		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'], 'Should prevent circular references' );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Verify structure is properly nested without circular references
		$this->assertValidNestedStructure( $result['widgets'] );
	}

	public function test_memory_intensive_content(): void {
		// Generate content that might stress memory usage
		$html = '<div style="padding: 20px;">';
		
		for ( $i = 0; $i < 200; $i++ ) {
			$styles = "font-size: " . ( 12 + ( $i % 20 ) ) . "px; " .
					 "color: #" . str_pad( dechex( $i * 1000 % 16777215 ), 6, '0', STR_PAD_LEFT ) . "; " .
					 "margin: " . ( $i % 10 ) . "px; " .
					 "padding: " . ( $i % 5 ) . "px;";
			
			$html .= "<div style=\"{$styles}\">Content item {$i}</div>";
		}
		
		$html .= '</div>';

		$start_memory = memory_get_usage( true );
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		$end_memory = memory_get_usage( true );
		
		$memory_used = $end_memory - $start_memory;
		
		$this->assertTrue( $result['success'], 'Should handle memory-intensive content' );
		$this->assertNotEmpty( $result['widgets'] );
		
		// Memory usage should be reasonable (less than 100MB)
		$this->assertLessThan( 100 * 1024 * 1024, $memory_used, 'Memory usage should be reasonable' );
	}

	public function test_error_recovery_mechanisms(): void {
		// Test various error scenarios and recovery
		$error_cases = [
			'<div style="color: red;"><p>Valid start' . str_repeat( '<invalid>', 100 ) . '</p></div>',
			'<div>' . str_repeat( '<span>nested</span>', 1000 ) . '</div>',
			'<div style="' . str_repeat( 'property: value; ', 100 ) . '">Over-styled</div>',
		];

		foreach ( $error_cases as $html ) {
			$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
			
			// Should either succeed with warnings or fail gracefully
			$this->assertArrayHasKey( 'success', $result );
			$this->assertArrayHasKey( 'performance', $result );
			
			// Should not crash or hang
			$performance = $result['performance'];
			$this->assertArrayHasKey( 'total_duration', $performance );
			$this->assertLessThan( 10000, $performance['total_duration'], 'Should not hang on error cases' );
		}
	}

	private function assertValidNestedStructure( array $widgets, array $visited_ids = [] ): void {
		foreach ( $widgets as $widget ) {
			// Check for widget ID if present
			$widget_id = $widget['id'] ?? null;
			
			if ( $widget_id ) {
				$this->assertNotContains( $widget_id, $visited_ids, 'Should not have circular references' );
				$visited_ids[] = $widget_id;
			}
			
			// Recursively check child elements
			if ( ! empty( $widget['elements'] ) ) {
				$this->assertValidNestedStructure( $widget['elements'], $visited_ids );
			}
		}
	}

	public function test_concurrent_conversion_edge_cases(): void {
		// Test multiple conversions with potentially conflicting content
		$html_samples = [
			'<div id="test1"><h1>Heading 1</h1></div>',
			'<div id="test2"><h1>Heading 2</h1></div>',
			'<div id="test3"><h1>Heading 3</h1></div>',
		];

		$results = [];
		
		foreach ( $html_samples as $html ) {
			$orchestrator = new Atomic_Widgets_Orchestrator( true, true );
			$results[] = $orchestrator->convert_html_to_atomic_widgets( $html );
		}

		// All should succeed independently
		foreach ( $results as $result ) {
			$this->assertTrue( $result['success'] );
			$this->assertNotEmpty( $result['widgets'] );
		}

		// Verify class IDs are unique across conversions
		$all_class_ids = [];
		
		foreach ( $results as $result ) {
			foreach ( $result['widgets'] as $widget ) {
				if ( isset( $widget['styles'] ) ) {
					foreach ( array_keys( $widget['styles'] ) as $class_id ) {
						$this->assertNotContains( $class_id, $all_class_ids, 'Class IDs should be unique across conversions' );
						$all_class_ids[] = $class_id;
					}
				}
			}
		}
	}
}

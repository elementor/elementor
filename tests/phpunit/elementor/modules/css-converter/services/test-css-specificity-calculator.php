<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Css_Specificity_Calculator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group css-specificity
 */
class Test_Css_Specificity_Calculator extends Elementor_Test_Base {

	private $css_specificity_calculator;

	public function setUp(): void {
		parent::setUp();
		$this->css_specificity_calculator = new Css_Specificity_Calculator();
	}

	public function test_calculates_basic_selector_specificity() {
		// Element selectors (0,0,0,1)
		$this->assertEquals( [ 0, 0, 0, 1 ], $this->css_specificity_calculator->calculate_specificity( 'div' ) );
		$this->assertEquals( [ 0, 0, 0, 1 ], $this->css_specificity_calculator->calculate_specificity( 'h1' ) );
		$this->assertEquals( [ 0, 0, 0, 1 ], $this->css_specificity_calculator->calculate_specificity( 'p' ) );
		
		// Class selectors (0,0,1,0)
		$this->assertEquals( [ 0, 0, 1, 0 ], $this->css_specificity_calculator->calculate_specificity( '.class' ) );
		$this->assertEquals( [ 0, 0, 1, 0 ], $this->css_specificity_calculator->calculate_specificity( '.btn' ) );
		
		// ID selectors (0,1,0,0)
		$this->assertEquals( [ 0, 1, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( '#id' ) );
		$this->assertEquals( [ 0, 1, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( '#main-title' ) );
	}

	public function test_calculates_important_declaration_specificity() {
		// !important declarations should have highest priority (1,0,0,0)
		$this->assertEquals( [ 1, 0, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( 'div !important' ) );
		$this->assertEquals( [ 1, 0, 1, 0 ], $this->css_specificity_calculator->calculate_specificity( '.class !important' ) );
		$this->assertEquals( [ 1, 1, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( '#id !important' ) );
	}

	public function test_calculates_complex_selector_specificity() {
		// Multiple classes (0,0,2,0)
		$this->assertEquals( [ 0, 0, 2, 0 ], $this->css_specificity_calculator->calculate_specificity( '.class1.class2' ) );
		
		// ID + class + element (0,1,1,1)
		$this->assertEquals( [ 0, 1, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '#id .class div' ) );
		
		// Multiple classes + element (0,0,2,1)
		$this->assertEquals( [ 0, 0, 2, 1 ], $this->css_specificity_calculator->calculate_specificity( '.class1.class2 p' ) );
		
		// Complex with !important (1,1,1,1)
		$this->assertEquals( [ 1, 1, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '#id .class div !important' ) );
	}

	public function test_calculates_descendant_selector_specificity() {
		// Descendant selectors
		$this->assertEquals( [ 0, 0, 0, 2 ], $this->css_specificity_calculator->calculate_specificity( 'div p' ) );
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '.container div' ) );
		$this->assertEquals( [ 0, 1, 0, 1 ], $this->css_specificity_calculator->calculate_specificity( '#main div' ) );
		
		// Child selectors
		$this->assertEquals( [ 0, 0, 0, 2 ], $this->css_specificity_calculator->calculate_specificity( 'div > p' ) );
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '.container > div' ) );
	}

	public function test_calculates_pseudo_class_specificity() {
		// Pseudo-classes count as classes (0,0,1,0)
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( 'a:hover' ) );
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( 'input:focus' ) );
		$this->assertEquals( [ 0, 0, 2, 1 ], $this->css_specificity_calculator->calculate_specificity( 'a:hover:visited' ) );
	}

	public function test_calculates_attribute_selector_specificity() {
		// Attribute selectors count as classes (0,0,1,0)
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( 'input[type="text"]' ) );
		$this->assertEquals( [ 0, 0, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( 'a[href^="https"]' ) );
		$this->assertEquals( [ 0, 0, 2, 1 ], $this->css_specificity_calculator->calculate_specificity( 'input[type="text"][required]' ) );
	}

	public function test_formats_specificity_correctly() {
		$specificity = [ 0, 1, 2, 3 ];
		$formatted = $this->css_specificity_calculator->format_specificity( $specificity );
		
		$this->assertIsString( $formatted );
		$this->assertEquals( '0,1,2,3', $formatted );
		
		// Test with different values
		$specificity2 = [ 1, 0, 0, 0 ];
		$formatted2 = $this->css_specificity_calculator->format_specificity( $specificity2 );
		$this->assertEquals( '1,0,0,0', $formatted2 );
	}

	public function test_categorizes_css_rules_correctly() {
		// Test inline styles (highest specificity without !important)
		$inline_rule = $this->css_specificity_calculator->categorize_css_rule( 
			'style', 'color', 'red', false 
		);
		$this->assertEquals( 'widget_props', $inline_rule['target'] );
		$this->assertTrue( $inline_rule['specificity'] > 1000 ); // Inline weight
		
		// Test ID selectors
		$id_rule = $this->css_specificity_calculator->categorize_css_rule( 
			'#main-title', 'color', 'blue', false 
		);
		$this->assertEquals( 'widget_props', $id_rule['target'] );
		
		// Test class selectors
		$class_rule = $this->css_specificity_calculator->categorize_css_rule( 
			'.title', 'color', 'green', false 
		);
		$this->assertEquals( 'global_classes', $class_rule['target'] );
		
		// Test element selectors
		$element_rule = $this->css_specificity_calculator->categorize_css_rule( 
			'h1', 'color', 'black', false 
		);
		$this->assertEquals( 'element_styles', $element_rule['target'] );
	}

	public function test_important_declarations_override_everything() {
		$styles = [
			[
				'property' => 'color',
				'value' => 'red',
				'specificity' => [ 0, 0, 0, 1 ], // Element
				'important' => false,
				'order' => 0,
			],
			[
				'property' => 'color',
				'value' => 'blue',
				'specificity' => [ 0, 0, 1, 0 ], // Class
				'important' => false,
				'order' => 1,
			],
			[
				'property' => 'color',
				'value' => 'green',
				'specificity' => [ 0, 1, 0, 0 ], // ID
				'important' => false,
				'order' => 2,
			],
			[
				'property' => 'color',
				'value' => 'yellow',
				'specificity' => [ 0, 0, 0, 1 ], // Element with !important
				'important' => true,
				'order' => 3,
			],
		];
		
		$winning_style = $this->css_specificity_calculator->get_winning_style( $styles );
		
		$this->assertNotNull( $winning_style );
		$this->assertEquals( 'yellow', $winning_style['value'] );
		$this->assertTrue( $winning_style['important'] );
	}

	public function test_cascade_order_breaks_specificity_ties() {
		$styles = [
			[
				'property' => 'color',
				'value' => 'red',
				'specificity' => [ 0, 0, 1, 0 ], // Class
				'important' => false,
				'order' => 0,
			],
			[
				'property' => 'color',
				'value' => 'blue',
				'specificity' => [ 0, 0, 1, 0 ], // Same specificity
				'important' => false,
				'order' => 1, // Later in cascade
			],
		];
		
		$winning_style = $this->css_specificity_calculator->get_winning_style( $styles );
		
		$this->assertNotNull( $winning_style );
		$this->assertEquals( 'blue', $winning_style['value'] ); // Later in cascade wins
	}

	public function test_handles_edge_cases() {
		// Empty selector
		$empty_specificity = $this->css_specificity_calculator->calculate_specificity( '' );
		$this->assertEquals( [ 0, 0, 0, 0 ], $empty_specificity );
		
		// Universal selector
		$universal_specificity = $this->css_specificity_calculator->calculate_specificity( '*' );
		$this->assertEquals( [ 0, 0, 0, 0 ], $universal_specificity );
		
		// Pseudo-elements (should count as elements)
		$pseudo_element_specificity = $this->css_specificity_calculator->calculate_specificity( 'p::before' );
		$this->assertEquals( [ 0, 0, 0, 2 ], $pseudo_element_specificity ); // p + ::before
	}

	public function test_handles_malformed_selectors_gracefully() {
		// Should not throw exceptions for malformed selectors
		$malformed_selectors = [
			'.class..double-dot',
			'#id##double-hash',
			'element[attr=unclosed',
			':not(',
			'@media screen',
		];
		
		foreach ( $malformed_selectors as $selector ) {
			$specificity = $this->css_specificity_calculator->calculate_specificity( $selector );
			$this->assertIsArray( $specificity );
			$this->assertCount( 4, $specificity );
		}
	}
}

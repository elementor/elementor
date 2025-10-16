<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Services\Css\Css_Processor;
use Elementor\Modules\CssConverter\Parsers\CssParser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-id-selectors
 */
class Test_Id_Selector_Fix extends Elementor_Test_Base {

	public function test_css_processor_extracts_id_selector_rules() {
		$css_processor = new Css_Processor();
		
		// Test CSS with ID selectors
		$css = '#container { background: red; padding: 20px; } #title { color: blue; font-size: 24px; }';
		
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'attributes' => [ 'id' => 'container' ],
				'children' => [
					[
						'widget_type' => 'e-heading',
						'attributes' => [ 'id' => 'title' ],
						'children' => [],
					],
				],
			],
		];

		$result = $css_processor->process_css_for_widgets( $css, $widgets );

		// Should have processed CSS rules
		$this->assertArrayHasKey( 'widget_styles', $result );
		$this->assertArrayHasKey( 'stats', $result );
		$this->assertGreaterThan( 0, $result['stats']['rules_processed'] );
	}

	public function test_css_parser_correctly_parses_id_selectors() {
		$css_parser = new CssParser();
		
		$css = '#container { background: red; padding: 20px; } #title { color: blue; font-size: 24px; }';
		
		$parsed_css = $css_parser->parse( $css );
		
		// Test that ParsedCss object is created correctly
		$this->assertNotNull( $parsed_css );
		$this->assertTrue( method_exists( $parsed_css, 'get_document' ) );
		
		$document = $parsed_css->get_document();
		$this->assertNotNull( $document );
		$this->assertTrue( method_exists( $document, 'getAllRuleSets' ) );
		
		// Test that rule sets are extracted
		$rule_sets = $document->getAllRuleSets();
		$this->assertNotEmpty( $rule_sets );
		$this->assertCount( 2, $rule_sets ); // Should have 2 rule sets (#container and #title)
	}

	public function test_css_processor_extract_css_rules_method() {
		$css_processor = new Css_Processor();
		$css_parser = new CssParser();
		
		$css = '#container { background: red; padding: 20px; } #title { color: blue; font-size: 24px; }';
		$parsed_css = $css_parser->parse( $css );
		
		// Use reflection to test the private extract_css_rules method
		$reflection = new \ReflectionClass( $css_processor );
		$method = $reflection->getMethod( 'extract_css_rules' );
		$method->setAccessible( true );
		
		$rules = $method->invoke( $css_processor, $parsed_css );
		
		// Should extract 4 rules (2 selectors × 2 properties each)
		$this->assertNotEmpty( $rules );
		$this->assertCount( 4, $rules );
		
		// Test rule structure
		$container_background_rule = null;
		$title_color_rule = null;
		
		foreach ( $rules as $rule ) {
			if ( $rule['selector'] === '#container' && $rule['property'] === 'background' ) {
				$container_background_rule = $rule;
			}
			if ( $rule['selector'] === '#title' && $rule['property'] === 'color' ) {
				$title_color_rule = $rule;
			}
		}
		
		$this->assertNotNull( $container_background_rule );
		$this->assertEquals( 'red', $container_background_rule['value'] );
		
		$this->assertNotNull( $title_color_rule );
		$this->assertEquals( 'blue', $title_color_rule['value'] );
	}

	public function test_id_selector_styles_applied_to_widgets() {
		$css_processor = new Css_Processor();
		
		$css = '#container { background: red; padding: 20px; } #title { color: blue; font-size: 24px; }';
		
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'original_tag' => 'div',
				'attributes' => [ 'id' => 'container' ],
				'inline_css' => [],
			],
		];

		$css_result = $css_processor->process_css_for_widgets( $css, $widgets );
		$applied_styles = $css_processor->apply_styles_to_widget( $widgets[0], $css_result );

		// Should have computed styles from ID selector
		$this->assertArrayHasKey( 'computed_styles', $applied_styles );
		$this->assertNotEmpty( $applied_styles['computed_styles'] );
		
		// Should have background and padding styles
		$computed_styles = $applied_styles['computed_styles'];
		$this->assertArrayHasKey( 'background', $computed_styles );
		$this->assertArrayHasKey( 'padding', $computed_styles );
		
		$this->assertEquals( 'red', $computed_styles['background']['value'] );
		$this->assertEquals( '20px', $computed_styles['padding']['value'] );
	}

	public function test_nested_widgets_with_id_selectors() {
		$css_processor = new Css_Processor();
		
		$css = '#container { background: red; } #title { color: blue; }';
		
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'original_tag' => 'div',
				'attributes' => [ 'id' => 'container' ],
				'inline_css' => [],
				'children' => [
					[
						'widget_type' => 'e-heading',
						'original_tag' => 'h1',
						'attributes' => [ 'id' => 'title' ],
						'inline_css' => [],
						'children' => [],
					],
				],
			],
		];

		$css_result = $css_processor->process_css_for_widgets( $css, $widgets );
		
		// Test parent widget
		$parent_styles = $css_processor->apply_styles_to_widget( $widgets[0], $css_result );
		$this->assertArrayHasKey( 'background', $parent_styles['computed_styles'] );
		$this->assertEquals( 'red', $parent_styles['computed_styles']['background']['value'] );
		
		// Test child widget
		$child_styles = $css_processor->apply_styles_to_widget( $widgets[0]['children'][0], $css_result );
		$this->assertArrayHasKey( 'color', $child_styles['computed_styles'] );
		$this->assertEquals( 'blue', $child_styles['computed_styles']['color']['value'] );
	}

	public function test_complex_id_selectors_with_multiple_properties() {
		$css_processor = new Css_Processor();
		
		// Test the exact CSS from the user's example
		$css = '#container { background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } #title { color: white; font-size: 32px; font-weight: 700; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } #subtitle { color: #e0e6ed; font-size: 18px; margin-top: 10px; }';
		
		$widgets = [
			[
				'widget_type' => 'e-flexbox',
				'original_tag' => 'div',
				'attributes' => [ 'id' => 'container' ],
				'inline_css' => [],
				'children' => [
					[
						'widget_type' => 'e-heading',
						'original_tag' => 'h1',
						'attributes' => [ 'id' => 'title' ],
						'inline_css' => [],
						'children' => [],
					],
					[
						'widget_type' => 'e-paragraph',
						'original_tag' => 'p',
						'attributes' => [ 'id' => 'subtitle' ],
						'inline_css' => [],
						'children' => [],
					],
				],
			],
		];

		$css_result = $css_processor->process_css_for_widgets( $css, $widgets );
		
		// Test container styles
		$container_styles = $css_processor->apply_styles_to_widget( $widgets[0], $css_result );
		$container_computed = $container_styles['computed_styles'];
		
		$this->assertArrayHasKey( 'background', $container_computed );
		$this->assertArrayHasKey( 'padding', $container_computed );
		$this->assertArrayHasKey( 'border-radius', $container_computed );
		$this->assertArrayHasKey( 'box-shadow', $container_computed );
		
		// Test title styles
		$title_styles = $css_processor->apply_styles_to_widget( $widgets[0]['children'][0], $css_result );
		$title_computed = $title_styles['computed_styles'];
		
		$this->assertArrayHasKey( 'color', $title_computed );
		$this->assertArrayHasKey( 'font-size', $title_computed );
		$this->assertArrayHasKey( 'font-weight', $title_computed );
		$this->assertArrayHasKey( 'text-align', $title_computed );
		$this->assertArrayHasKey( 'text-shadow', $title_computed );
		
		$this->assertEquals( 'white', $title_computed['color']['value'] );
		$this->assertEquals( '32px', $title_computed['font-size']['value'] );
		$this->assertEquals( '700', $title_computed['font-weight']['value'] );
		
		// Test subtitle styles
		$subtitle_styles = $css_processor->apply_styles_to_widget( $widgets[0]['children'][1], $css_result );
		$subtitle_computed = $subtitle_styles['computed_styles'];
		
		$this->assertArrayHasKey( 'color', $subtitle_computed );
		$this->assertArrayHasKey( 'font-size', $subtitle_computed );
		$this->assertArrayHasKey( 'margin-top', $subtitle_computed );
		
		$this->assertEquals( '#e0e6ed', $subtitle_computed['color']['value'] );
		$this->assertEquals( '18px', $subtitle_computed['font-size']['value'] );
		$this->assertEquals( '10px', $subtitle_computed['margin-top']['value'] );
	}
}

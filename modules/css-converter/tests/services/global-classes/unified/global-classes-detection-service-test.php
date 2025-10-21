<?php

namespace Elementor\Tests\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Detection_Service;
use WP_UnitTestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Detection_Service_Test extends WP_UnitTestCase {
	
	private Global_Classes_Detection_Service $service;
	
	public function setUp(): void {
		parent::setUp();
		$this->service = new Global_Classes_Detection_Service();
	}
	
	public function test_detects_valid_class_selectors() {
		$css_rules = [
			[
				'selector' => '.my-class',
				'properties' => [
					[ 'property' => 'color', 'value' => 'red' ],
				],
			],
			[
				'selector' => '.another-class',
				'properties' => [
					[ 'property' => 'background', 'value' => 'blue' ],
				],
			],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'my-class', $result );
		$this->assertArrayHasKey( 'another-class', $result );
		
		$this->assertEquals( '.my-class', $result['my-class']['selector'] );
		$this->assertEquals( 'css-converter', $result['my-class']['source'] );
		$this->assertCount( 1, $result['my-class']['properties'] );
	}
	
	public function test_skips_elementor_prefixed_classes() {
		$css_rules = [
			[
				'selector' => '.e-con-12345',
				'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ],
			],
			[
				'selector' => '.elementor-widget',
				'properties' => [ [ 'property' => 'color', 'value' => 'blue' ] ],
			],
			[
				'selector' => '.e-button',
				'properties' => [ [ 'property' => 'color', 'value' => 'green' ] ],
			],
			[
				'selector' => '.custom-class',
				'properties' => [ [ 'property' => 'color', 'value' => 'yellow' ] ],
			],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'custom-class', $result );
		$this->assertArrayNotHasKey( 'e-con-12345', $result );
		$this->assertArrayNotHasKey( 'elementor-widget', $result );
		$this->assertArrayNotHasKey( 'e-button', $result );
	}
	
	public function test_skips_non_class_selectors() {
		$css_rules = [
			[ 'selector' => 'p', 'properties' => [] ],
			[ 'selector' => '#my-id', 'properties' => [] ],
			[ 'selector' => '[data-attr]', 'properties' => [] ],
			[ 'selector' => 'div > span', 'properties' => [] ],
			[ 'selector' => '.valid-class', 'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ] ],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'valid-class', $result );
	}
	
	public function test_skips_empty_or_invalid_selectors() {
		$css_rules = [
			[ 'selector' => '', 'properties' => [] ],
			[ 'selector' => '   ', 'properties' => [] ],
			[ 'selector' => '.', 'properties' => [] ],
			[ 'properties' => [] ], // Missing selector
			[ 'selector' => '.valid', 'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ] ],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'valid', $result );
	}
	
	public function test_skips_too_long_class_names() {
		$long_class_name = str_repeat( 'a', 51 ); // 51 characters (over limit)
		$css_rules = [
			[
				'selector' => '.' . $long_class_name,
				'properties' => [ [ 'property' => 'color', 'value' => 'red' ] ],
			],
			[
				'selector' => '.valid-length',
				'properties' => [ [ 'property' => 'color', 'value' => 'blue' ] ],
			],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'valid-length', $result );
		$this->assertArrayNotHasKey( $long_class_name, $result );
	}
	
	public function test_handles_empty_css_rules() {
		$result = $this->service->detect_css_class_selectors( [] );
		
		$this->assertEmpty( $result );
		$this->assertIsArray( $result );
	}
	
	public function test_get_detection_stats() {
		$css_rules = [
			[ 'selector' => '.valid-class', 'properties' => [] ],
			[ 'selector' => '.e-con-skip', 'properties' => [] ],
			[ 'selector' => 'p', 'properties' => [] ],
			[ 'selector' => '.' . str_repeat( 'a', 51 ), 'properties' => [] ],
			[ 'selector' => '', 'properties' => [] ],
		];
		
		$stats = $this->service->get_detection_stats( $css_rules );
		
		$this->assertEquals( 5, $stats['total_rules'] );
		$this->assertEquals( 3, $stats['class_selectors'] ); // .valid-class, .e-con-skip, .aaa...
		$this->assertEquals( 1, $stats['valid_classes'] ); // Only .valid-class
		$this->assertEquals( 1, $stats['skipped_elementor'] ); // .e-con-skip
		$this->assertEquals( 1, $stats['skipped_invalid'] ); // Empty selector
		$this->assertEquals( 1, $stats['skipped_too_long'] ); // Long class name
	}
	
	public function test_preserves_properties_in_detected_classes() {
		$css_rules = [
			[
				'selector' => '.test-class',
				'properties' => [
					[ 'property' => 'color', 'value' => '#ff0000' ],
					[ 'property' => 'font-size', 'value' => '16px' ],
				],
			],
		];
		
		$result = $this->service->detect_css_class_selectors( $css_rules );
		
		$this->assertArrayHasKey( 'test-class', $result );
		$this->assertCount( 2, $result['test-class']['properties'] );
		$this->assertEquals( 'color', $result['test-class']['properties'][0]['property'] );
		$this->assertEquals( '#ff0000', $result['test-class']['properties'][0]['value'] );
	}
}

<?php

namespace Elementor\Tests\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use WP_UnitTestCase;
use Mockery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Conversion_Service_Test extends WP_UnitTestCase {
	
	private Global_Classes_Conversion_Service $service;
	private $mock_css_processor;
	
	public function setUp(): void {
		parent::setUp();
		
		$this->mock_css_processor = Mockery::mock( Unified_Css_Processor::class );
		$this->service = new Global_Classes_Conversion_Service( $this->mock_css_processor );
	}
	
	public function tearDown(): void {
		Mockery::close();
		parent::tearDown();
	}
	
	public function test_converts_css_properties_to_atomic_props() {
		$detected_classes = [
			'my-class' => [
				'properties' => [
					[ 'property' => 'color', 'value' => '#ff0000' ],
					[ 'property' => 'font-size', 'value' => '16px' ],
				],
				'source' => 'css-converter',
				'selector' => '.my-class',
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'color', '#ff0000' )
			->andReturn( [
				'$$type' => 'color',
				'value' => '#ff0000',
			] );
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'font-size', '16px' )
			->andReturn( [
				'$$type' => 'size',
				'value' => '16px',
			] );
		
		$result = $this->service->convert_to_atomic_props( $detected_classes );
		
		$this->assertArrayHasKey( 'my-class', $result );
		$this->assertArrayHasKey( 'atomic_props', $result['my-class'] );
		$this->assertArrayHasKey( 'color', $result['my-class']['atomic_props'] );
		$this->assertArrayHasKey( 'font-size', $result['my-class']['atomic_props'] );
		
		$this->assertEquals( 'color', $result['my-class']['atomic_props']['color']['$$type'] );
		$this->assertEquals( '#ff0000', $result['my-class']['atomic_props']['color']['value'] );
	}
	
	public function test_skips_classes_with_no_convertible_properties() {
		$detected_classes = [
			'my-class' => [
				'properties' => [
					[ 'property' => 'unknown-prop', 'value' => 'value' ],
				],
				'source' => 'css-converter',
				'selector' => '.my-class',
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'unknown-prop', 'value' )
			->andReturn( null );
		
		$result = $this->service->convert_to_atomic_props( $detected_classes );
		
		$this->assertArrayNotHasKey( 'my-class', $result );
	}
	
	public function test_skips_properties_without_atomic_type() {
		$detected_classes = [
			'my-class' => [
				'properties' => [
					[ 'property' => 'color', 'value' => '#ff0000' ],
				],
				'source' => 'css-converter',
				'selector' => '.my-class',
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'color', '#ff0000' )
			->andReturn( [ 'value' => '#ff0000' ] ); // Missing $$type
		
		$result = $this->service->convert_to_atomic_props( $detected_classes );
		
		$this->assertArrayNotHasKey( 'my-class', $result );
	}
	
	public function test_handles_empty_or_invalid_properties() {
		$detected_classes = [
			'my-class' => [
				'properties' => [
					[ 'property' => '', 'value' => 'red' ], // Empty property
					[ 'property' => 'color', 'value' => '' ], // Empty value
					[ 'value' => 'blue' ], // Missing property
					[ 'property' => 'font-size' ], // Missing value
					[ 'property' => 'background', 'value' => 'white' ], // Valid
				],
				'source' => 'css-converter',
				'selector' => '.my-class',
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'background', 'white' )
			->andReturn( [
				'$$type' => 'color',
				'value' => 'white',
			] );
		
		$result = $this->service->convert_to_atomic_props( $detected_classes );
		
		$this->assertArrayHasKey( 'my-class', $result );
		$this->assertCount( 1, $result['my-class']['atomic_props'] );
		$this->assertArrayHasKey( 'background', $result['my-class']['atomic_props'] );
	}
	
	public function test_preserves_source_and_selector_info() {
		$detected_classes = [
			'my-class' => [
				'properties' => [
					[ 'property' => 'color', 'value' => 'red' ],
				],
				'source' => 'css-converter',
				'selector' => '.my-class',
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'color', 'red' )
			->andReturn( [
				'$$type' => 'color',
				'value' => 'red',
			] );
		
		$result = $this->service->convert_to_atomic_props( $detected_classes );
		
		$this->assertEquals( 'css-converter', $result['my-class']['source'] );
		$this->assertEquals( '.my-class', $result['my-class']['original_selector'] );
	}
	
	public function test_get_conversion_stats() {
		$detected_classes = [
			'class-with-props' => [
				'properties' => [
					[ 'property' => 'color', 'value' => 'red' ],
					[ 'property' => 'font-size', 'value' => '16px' ],
				],
			],
			'class-no-props' => [
				'properties' => [
					[ 'property' => 'unknown', 'value' => 'value' ],
				],
			],
		];
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'color', 'red' )
			->andReturn( [ '$$type' => 'color', 'value' => 'red' ] );
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'font-size', '16px' )
			->andReturn( [ '$$type' => 'size', 'value' => '16px' ] );
		
		$this->mock_css_processor
			->shouldReceive( 'convert_property_if_needed' )
			->with( 'unknown', 'value' )
			->andReturn( null );
		
		$stats = $this->service->get_conversion_stats( $detected_classes );
		
		$this->assertEquals( 2, $stats['total_classes'] );
		$this->assertEquals( 1, $stats['converted_classes'] );
		$this->assertEquals( 1, $stats['skipped_classes'] );
		$this->assertEquals( 3, $stats['total_properties'] );
		$this->assertEquals( 2, $stats['converted_properties'] );
		$this->assertEquals( 1, $stats['skipped_properties'] );
		$this->assertEquals( 66.67, $stats['conversion_rate'] );
	}
	
	public function test_validate_atomic_props() {
		$valid_props = [
			'color' => [
				'$$type' => 'color',
				'value' => '#ff0000',
			],
			'font-size' => [
				'$$type' => 'size',
				'value' => '16px',
			],
		];
		
		$result = $this->service->validate_atomic_props( $valid_props );
		
		$this->assertTrue( $result['valid'] );
		$this->assertEmpty( $result['errors'] );
	}
	
	public function test_validate_atomic_props_with_errors() {
		$invalid_props = [
			'color' => 'not-an-array',
			'font-size' => [
				'value' => '16px', // Missing $$type
			],
			'background' => [
				'$$type' => 'color', // Missing value
			],
		];
		
		$result = $this->service->validate_atomic_props( $invalid_props );
		
		$this->assertFalse( $result['valid'] );
		$this->assertCount( 3, $result['errors'] );
		$this->assertStringContainsString( 'not an array', $result['errors'][0] );
		$this->assertStringContainsString( 'missing $$type', $result['errors'][1] );
		$this->assertStringContainsString( 'missing value', $result['errors'][2] );
	}
}

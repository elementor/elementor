<?php

namespace Elementor\Tests\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Integration_Service;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Detection_Service;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Conversion_Service;
use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Registration_Service;
use WP_UnitTestCase;
use Mockery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Integration_Service_Test extends WP_UnitTestCase {
	
	private Global_Classes_Integration_Service $service;
	private $mock_detection_service;
	private $mock_conversion_service;
	private $mock_registration_service;
	
	public function setUp(): void {
		parent::setUp();
		
		$this->mock_detection_service = Mockery::mock( Global_Classes_Detection_Service::class );
		$this->mock_conversion_service = Mockery::mock( Global_Classes_Conversion_Service::class );
		$this->mock_registration_service = Mockery::mock( Global_Classes_Registration_Service::class );
		
		$this->service = new Global_Classes_Integration_Service(
			$this->mock_detection_service,
			$this->mock_conversion_service,
			$this->mock_registration_service
		);
	}
	
	public function tearDown(): void {
		Mockery::close();
		parent::tearDown();
	}
	
	public function test_process_css_rules_no_classes_detected() {
		$css_rules = [
			[ 'selector' => 'p', 'properties' => [] ],
		];
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( [] );
		
		$result = $this->service->process_css_rules( $css_rules );
		
		$this->assertTrue( $result['success'] );
		$this->assertEquals( 0, $result['detected'] );
		$this->assertEquals( 0, $result['converted'] );
		$this->assertEquals( 0, $result['registered'] );
		$this->assertStringContainsString( 'No CSS class selectors found', $result['message'] );
		$this->assertArrayHasKey( 'processing_time', $result );
	}
	
	public function test_process_css_rules_no_convertible_properties() {
		$css_rules = [
			[ 'selector' => '.my-class', 'properties' => [] ],
		];
		
		$detected = [
			'my-class' => [ 'properties' => [] ],
		];
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( $detected );
		
		$this->mock_conversion_service
			->shouldReceive( 'convert_to_atomic_props' )
			->with( $detected )
			->andReturn( [] );
		
		$result = $this->service->process_css_rules( $css_rules );
		
		$this->assertTrue( $result['success'] );
		$this->assertEquals( 1, $result['detected'] );
		$this->assertEquals( 0, $result['converted'] );
		$this->assertEquals( 0, $result['registered'] );
		$this->assertStringContainsString( 'No properties could be converted', $result['message'] );
	}
	
	public function test_process_css_rules_successful_registration() {
		$css_rules = [
			[ 'selector' => '.my-class', 'properties' => [] ],
		];
		
		$detected = [
			'my-class' => [ 'properties' => [] ],
		];
		
		$converted = [
			'my-class' => [ 'atomic_props' => [] ],
		];
		
		$registration_result = [
			'registered' => 1,
			'skipped' => 0,
			'total_classes' => 5,
		];
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( $detected );
		
		$this->mock_conversion_service
			->shouldReceive( 'convert_to_atomic_props' )
			->with( $detected )
			->andReturn( $converted );
		
		$this->mock_registration_service
			->shouldReceive( 'register_with_elementor' )
			->with( $converted )
			->andReturn( $registration_result );
		
		$result = $this->service->process_css_rules( $css_rules );
		
		$this->assertTrue( $result['success'] );
		$this->assertEquals( 1, $result['detected'] );
		$this->assertEquals( 1, $result['converted'] );
		$this->assertEquals( 1, $result['registered'] );
		$this->assertEquals( 0, $result['skipped'] );
		$this->assertEquals( 5, $result['total_classes'] );
		$this->assertStringContainsString( 'Successfully registered 1 global class', $result['message'] );
	}
	
	public function test_process_css_rules_registration_error() {
		$css_rules = [
			[ 'selector' => '.my-class', 'properties' => [] ],
		];
		
		$detected = [
			'my-class' => [ 'properties' => [] ],
		];
		
		$converted = [
			'my-class' => [ 'atomic_props' => [] ],
		];
		
		$registration_result = [
			'registered' => 0,
			'skipped' => 1,
			'error' => 'Repository not accessible',
		];
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( $detected );
		
		$this->mock_conversion_service
			->shouldReceive( 'convert_to_atomic_props' )
			->with( $detected )
			->andReturn( $converted );
		
		$this->mock_registration_service
			->shouldReceive( 'register_with_elementor' )
			->with( $converted )
			->andReturn( $registration_result );
		
		$result = $this->service->process_css_rules( $css_rules );
		
		$this->assertFalse( $result['success'] );
		$this->assertEquals( 'Repository not accessible', $result['error'] );
		$this->assertStringContainsString( 'Registration failed', $result['message'] );
	}
	
	public function test_get_detailed_stats() {
		$css_rules = [
			[ 'selector' => '.my-class', 'properties' => [] ],
		];
		
		$detected = [
			'my-class' => [ 'properties' => [] ],
		];
		
		$detection_stats = [ 'total_rules' => 1 ];
		$conversion_stats = [ 'total_classes' => 1 ];
		$repository_stats = [ 'available' => true ];
		
		$this->mock_detection_service
			->shouldReceive( 'get_detection_stats' )
			->with( $css_rules )
			->andReturn( $detection_stats );
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( $detected );
		
		$this->mock_conversion_service
			->shouldReceive( 'get_conversion_stats' )
			->with( $detected )
			->andReturn( $conversion_stats );
		
		$this->mock_registration_service
			->shouldReceive( 'get_repository_stats' )
			->andReturn( $repository_stats );
		
		$result = $this->service->get_detailed_stats( $css_rules );
		
		$this->assertArrayHasKey( 'detection', $result );
		$this->assertArrayHasKey( 'conversion', $result );
		$this->assertArrayHasKey( 'repository', $result );
		$this->assertEquals( $detection_stats, $result['detection'] );
		$this->assertEquals( $conversion_stats, $result['conversion'] );
		$this->assertEquals( $repository_stats, $result['repository'] );
	}
	
	public function test_validate_css_rules_valid() {
		$css_rules = [
			[
				'selector' => '.my-class',
				'properties' => [
					[ 'property' => 'color', 'value' => 'red' ],
				],
			],
		];
		
		$result = $this->service->validate_css_rules( $css_rules );
		
		$this->assertTrue( $result['valid'] );
		$this->assertEmpty( $result['errors'] );
	}
	
	public function test_validate_css_rules_empty() {
		$result = $this->service->validate_css_rules( [] );
		
		$this->assertTrue( $result['valid'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'No CSS rules provided', $result['warnings'][0] );
	}
	
	public function test_validate_css_rules_invalid() {
		$css_rules = [
			'not-an-array',
			[ 'properties' => [] ], // Missing selector
			[ 'selector' => '.class' ], // Missing properties
			[ 'selector' => '.class', 'properties' => 'not-array' ], // Invalid properties
		];
		
		$result = $this->service->validate_css_rules( $css_rules );
		
		$this->assertFalse( $result['valid'] );
		$this->assertCount( 4, $result['errors'] );
	}
	
	public function test_dry_run_successful() {
		$css_rules = [
			[ 'selector' => '.my-class', 'properties' => [] ],
		];
		
		$detected = [
			'my-class' => [ 'properties' => [] ],
		];
		
		$converted = [
			'my-class' => [ 'atomic_props' => [] ],
		];
		
		$duplicates = [
			'duplicates' => [],
			'new_classes' => [ 'my-class' ],
		];
		
		$repository_stats = [
			'available_slots' => 10,
		];
		
		$this->mock_detection_service
			->shouldReceive( 'detect_css_class_selectors' )
			->with( $css_rules )
			->andReturn( $detected );
		
		$this->mock_conversion_service
			->shouldReceive( 'convert_to_atomic_props' )
			->with( $detected )
			->andReturn( $converted );
		
		$this->mock_registration_service
			->shouldReceive( 'check_duplicate_classes' )
			->with( $converted )
			->andReturn( $duplicates );
		
		$this->mock_registration_service
			->shouldReceive( 'get_repository_stats' )
			->andReturn( $repository_stats );
		
		$result = $this->service->dry_run( $css_rules );
		
		$this->assertTrue( $result['success'] );
		$this->assertEquals( 1, $result['would_detect'] );
		$this->assertEquals( 1, $result['would_convert'] );
		$this->assertEquals( 1, $result['would_register'] );
		$this->assertEquals( 0, $result['would_skip'] );
		$this->assertEquals( 10, $result['available_slots'] );
		$this->assertStringContainsString( 'Would register 1 global class', $result['message'] );
	}
}

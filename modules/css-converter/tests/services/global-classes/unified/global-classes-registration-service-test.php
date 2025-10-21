<?php

namespace Elementor\Tests\Services\GlobalClasses\Unified;

use Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Registration_Service;
use WP_UnitTestCase;
use Mockery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Registration_Service_Test extends WP_UnitTestCase {
	
	private Global_Classes_Registration_Service $service;
	
	public function setUp(): void {
		parent::setUp();
		$this->service = new Global_Classes_Registration_Service();
	}
	
	public function tearDown(): void {
		Mockery::close();
		parent::tearDown();
	}
	
	public function test_handles_elementor_not_available() {
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$this->markTestSkipped( 'Elementor is available in this environment' );
		}
		
		$converted_classes = [
			'my-class' => [
				'atomic_props' => [
					'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				],
			],
		];
		
		$result = $this->service->register_with_elementor( $converted_classes );
		
		$this->assertEquals( 0, $result['registered'] );
		$this->assertEquals( 1, $result['skipped'] );
		$this->assertArrayHasKey( 'error', $result );
		$this->assertStringContainsString( 'not available', $result['error'] );
	}
	
	public function test_skips_classes_with_empty_atomic_props() {
		$converted_classes = [
			'empty-class' => [
				'atomic_props' => [],
			],
			'valid-class' => [
				'atomic_props' => [
					'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				],
			],
		];
		
		$result = $this->service->register_with_elementor( $converted_classes );
		
		$this->assertEquals( 0, $result['registered'] );
		$this->assertEquals( 2, $result['skipped'] );
	}
	
	public function test_check_duplicate_classes() {
		$converted_classes = [
			'new-class' => [
				'atomic_props' => [
					'color' => [ '$$type' => 'color', 'value' => '#ff0000' ],
				],
			],
			'existing-class' => [
				'atomic_props' => [
					'background' => [ '$$type' => 'color', 'value' => '#0000ff' ],
				],
			],
		];
		
		$result = $this->service->check_duplicate_classes( $converted_classes );
		
		$this->assertArrayHasKey( 'duplicates', $result );
		$this->assertArrayHasKey( 'new_classes', $result );
		$this->assertIsArray( $result['duplicates'] );
		$this->assertIsArray( $result['new_classes'] );
	}
	
	public function test_get_repository_stats_when_not_available() {
		if ( defined( 'ELEMENTOR_VERSION' ) ) {
			$this->markTestSkipped( 'Elementor is available in this environment' );
		}
		
		$stats = $this->service->get_repository_stats();
		
		$this->assertFalse( $stats['available'] );
		$this->assertArrayHasKey( 'error', $stats );
	}
	
	public function test_generate_class_id() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'generate_class_id' );
		$method->setAccessible( true );
		
		$class_id = $method->invoke( $this->service, 'my-custom-class' );
		
		$this->assertStringStartsWith( 'css-', $class_id );
		$this->assertEquals( 'css-my-custom-class', $class_id );
	}
	
	public function test_generate_class_id_sanitizes_name() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'generate_class_id' );
		$method->setAccessible( true );
		
		$class_id = $method->invoke( $this->service, 'My Class With Spaces!' );
		
		$this->assertStringStartsWith( 'css-', $class_id );
		$this->assertStringNotContainsString( ' ', $class_id );
		$this->assertStringNotContainsString( '!', $class_id );
	}
	
	public function test_create_class_config() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'create_class_config' );
		$method->setAccessible( true );
		
		$atomic_props = [
			'color' => [
				'$$type' => 'color',
				'value' => '#ff0000',
			],
		];
		
		$config = $method->invoke( $this->service, 'test-class', $atomic_props );
		
		$this->assertEquals( 'css-test-class', $config['id'] );
		$this->assertEquals( 'test-class', $config['label'] );
		$this->assertEquals( 'class', $config['type'] );
		$this->assertArrayHasKey( 'variants', $config );
		$this->assertCount( 1, $config['variants'] );
		
		$variant = $config['variants'][0];
		$this->assertEquals( 'desktop', $variant['meta']['breakpoint'] );
		$this->assertNull( $variant['meta']['state'] );
		$this->assertEquals( $atomic_props, $variant['props'] );
		
		$this->assertArrayHasKey( 'meta', $config );
		$this->assertEquals( 'css-converter', $config['meta']['source'] );
		$this->assertIsInt( $config['meta']['imported_at'] );
	}
	
	public function test_apply_classes_limit() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'apply_classes_limit' );
		$method->setAccessible( true );
		
		$new_classes = [
			'class1' => [ 'atomic_props' => [] ],
			'class2' => [ 'atomic_props' => [] ],
			'class3' => [ 'atomic_props' => [] ],
		];
		
		$existing_count = 48; // 2 slots remaining (limit is 50)
		
		$result = $method->invoke( $this->service, $new_classes, $existing_count );
		
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'class1', $result );
		$this->assertArrayHasKey( 'class2', $result );
		$this->assertArrayNotHasKey( 'class3', $result );
	}
	
	public function test_apply_classes_limit_no_slots() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'apply_classes_limit' );
		$method->setAccessible( true );
		
		$new_classes = [
			'class1' => [ 'atomic_props' => [] ],
		];
		
		$existing_count = 50; // No slots remaining
		
		$result = $method->invoke( $this->service, $new_classes, $existing_count );
		
		$this->assertEmpty( $result );
	}
	
	public function test_filter_new_classes() {
		$reflection = new \ReflectionClass( $this->service );
		$method = $reflection->getMethod( 'filter_new_classes' );
		$method->setAccessible( true );
		
		$converted_classes = [
			'existing-class' => [
				'atomic_props' => [
					'color' => [ '$$type' => 'color', 'value' => 'red' ],
				],
			],
			'new-class' => [
				'atomic_props' => [
					'background' => [ '$$type' => 'color', 'value' => 'blue' ],
				],
			],
			'empty-class' => [
				'atomic_props' => [],
			],
		];
		
		$existing_labels = [ 'existing-class' ];
		
		$result = $method->invoke( $this->service, $converted_classes, $existing_labels );
		
		$this->assertCount( 1, $result );
		$this->assertArrayHasKey( 'new-class', $result );
		$this->assertArrayNotHasKey( 'existing-class', $result );
		$this->assertArrayNotHasKey( 'empty-class', $result );
	}
}

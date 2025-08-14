<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Services\Global_Classes_Validation_Service;
use Elementor\Modules\GlobalClasses\Global_Classes_Errors;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Validation_Service extends Elementor_Test_Base {

	private $validation_service;

	public function setUp(): void {
		parent::setUp();
		$this->validation_service = new Global_Classes_Validation_Service();
	}

	public function test_validate_new_items_labels__returns_valid_when_no_changes() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'test' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'existing-label' ],
		];
		$changes = [
			'added' => [],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertEquals( '', $result['message'] );
		$this->assertEmpty( $result['meta']['modifiedLabels'] );
		$this->assertEquals( $request_items, $result['items'] );
	}

	public function test_validate_new_items_labels__handles_duplicate_with_existing_database_label() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['message'] );
		$this->assertCount( 1, $result['meta']['modifiedLabels'] );
		$this->assertEquals( 'duplicate-label', $result['meta']['modifiedLabels'][0]['original'] );
		$this->assertStringStartsWith( 'DUP_', $result['meta']['modifiedLabels'][0]['modified'] );
		$this->assertEquals( 'g-1', $result['meta']['modifiedLabels'][0]['id'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-1']['label'] );
	}

	public function test_validate_new_items_labels__handles_duplicate_within_request() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'other-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['message'] );
		$this->assertCount( 1, $result['meta']['modifiedLabels'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-2']['label'] );
	}

	public function test_validate_new_items_labels__handles_multiple_duplicates() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
			'g-3' => [ 'id' => 'g-3', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2', 'g-3' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 3 duplicate labels automatically', $result['message'] );
		$this->assertCount( 3, $result['meta']['modifiedLabels'] );
	}

	public function test_validate_new_items_labels__skips_empty_labels() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => '' ],
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['message'] );
		$this->assertCount( 1, $result['meta']['modifiedLabels'] );
		$this->assertEquals( 'g-2', $result['meta']['modifiedLabels'][0]['id'] );
	}

	public function test_validate_new_items_labels__handles_missing_label_key() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1' ], // missing label
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['message'] );
		$this->assertCount( 1, $result['meta']['modifiedLabels'] );
		$this->assertEquals( 'g-2', $result['meta']['modifiedLabels'][0]['id'] );
	}

	public function test_validate_new_items_labels__handles_missing_item_in_request() {
		// Arrange
		$request_items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
		];
		$existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ], // g-2 not in request_items
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->validate_new_items_labels( $request_items, $existing_items, $changes );

		// Assert
		$this->assertTrue( $result['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['message'] );
		$this->assertCount( 1, $result['meta']['modifiedLabels'] );
	}

	public function test_perform_final_validation__returns_no_changes_when_no_duplicates() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'unique-label' ],
		];
		$fresh_existing_items = [
			[ 'id' => 'existing', 'label' => 'existing-label' ],
		];
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->perform_final_validation( $items, $fresh_existing_items, $changes );

		// Assert
		$this->assertFalse( $result['has_changes'] );
		$this->assertEquals( $items, $result['items'] );
		$this->assertTrue( $result['validation_result']['is_valid'] );
		$this->assertEquals( '', $result['validation_result']['message'] );
	}

	public function test_perform_final_validation__handles_concurrency_duplicate() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
		];
		$fresh_existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->perform_final_validation( $items, $fresh_existing_items, $changes );

		// Assert
		$this->assertTrue( $result['has_changes'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-1']['label'] );
		$this->assertTrue( $result['validation_result']['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['validation_result']['message'] );
		$this->assertCount( 1, $result['validation_result']['meta']['modifiedLabels'] );
	}

	public function test_perform_final_validation__handles_duplicate_within_request() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
		];
		$fresh_existing_items = [
			[ 'id' => 'existing', 'label' => 'other-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->perform_final_validation( $items, $fresh_existing_items, $changes );

		// Assert
		$this->assertTrue( $result['has_changes'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-2']['label'] );
		$this->assertTrue( $result['validation_result']['is_valid'] );
		$this->assertStringContainsString( 'Modified 1 duplicate labels automatically', $result['validation_result']['message'] );
	}

	public function test_perform_final_validation__skips_empty_labels() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => '' ],
			'g-2' => [ 'id' => 'g-2', 'label' => 'duplicate-label' ],
		];
		$fresh_existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->perform_final_validation( $items, $fresh_existing_items, $changes );

		// Assert
		$this->assertTrue( $result['has_changes'] );
		$this->assertEquals( '', $result['items']['g-1']['label'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-2']['label'] );
		$this->assertCount( 1, $result['validation_result']['meta']['modifiedLabels'] );
	}

	public function test_perform_final_validation__handles_missing_item_in_changes() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'duplicate-label' ],
		];
		$fresh_existing_items = [
			[ 'id' => 'existing', 'label' => 'duplicate-label' ],
		];
		$changes = [
			'added' => [ 'g-1', 'g-2' ], // g-2 not in items
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->validation_service->perform_final_validation( $items, $fresh_existing_items, $changes );

		// Assert
		$this->assertTrue( $result['has_changes'] );
		$this->assertStringStartsWith( 'DUP_', $result['items']['g-1']['label'] );
		$this->assertCount( 1, $result['validation_result']['meta']['modifiedLabels'] );
	}

	public function test_validate_items_count__returns_null_when_under_limit() {
		// Arrange
		$items = [];
		for ( $i = 0; $i < 50; $i++ ) {
			$items[ "g-$i" ] = [ 'id' => "g-$i", 'label' => "label-$i" ];
		}

		// Act
		$result = $this->validation_service->validate_items_count( $items );

		// Assert
		$this->assertNull( $result );
	}

	public function test_validate_items_count__returns_error_when_at_limit() {
		// Arrange
		$items = [];
		for ( $i = 0; $i < 50; $i++ ) {
			$items[ "g-$i" ] = [ 'id' => "g-$i", 'label' => "label-$i" ];
		}

		// Act
		$result = $this->validation_service->validate_items_count( $items );

		// Assert
		$this->assertNull( $result ); // At limit is still valid
	}

	public function test_validate_items_count__returns_error_when_over_limit() {
		// Arrange
		$items = [];
		for ( $i = 0; $i < 51; $i++ ) {
			$items[ "g-$i" ] = [ 'id' => "g-$i", 'label' => "label-$i" ];
		}

		// Act
		$result = $this->validation_service->validate_items_count( $items );

		// Assert
		$this->assertInstanceOf( \WP_REST_Response::class, $result );
		$this->assertEquals( 400, $result->get_status() );
		$this->assertEquals( Global_Classes_Errors::ITEMS_LIMIT_EXCEEDED, $result->get_data()['code'] );
		$this->assertEquals( 51, $result->get_data()['data']['current_count'] );
		$this->assertEquals( 50, $result->get_data()['data']['max_allowed'] );
		$this->assertStringContainsString( 'Global classes limit exceeded', $result->get_data()['message'] );
	}

	public function test_validate_items_count__handles_empty_items() {
		// Arrange
		$items = [];

		// Act
		$result = $this->validation_service->validate_items_count( $items );

		// Assert
		$this->assertNull( $result );
	}

	public function test_validate_items_count__handles_single_item() {
		// Arrange
		$items = [
			'g-1' => [ 'id' => 'g-1', 'label' => 'test' ],
		];

		// Act
		$result = $this->validation_service->validate_items_count( $items );

		// Assert
		$this->assertNull( $result );
	}
}

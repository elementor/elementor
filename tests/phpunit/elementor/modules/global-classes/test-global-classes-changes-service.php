<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Services\Global_Classes_Changes_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Changes_Service extends Elementor_Test_Base {

	private $changes_service;

	public function setUp(): void {
		parent::setUp();
		$this->changes_service = new Global_Classes_Changes_Service();
	}

	public function test_has_changes__returns_true_when_changes_has_non_empty_arrays() {
		// Arrange
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_changes__returns_true_when_multiple_arrays_have_content() {
		// Arrange
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [ 'g-2' ],
			'modified' => [ 'g-3' ],
		];

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_has_changes__returns_false_when_all_arrays_are_empty() {
		// Arrange
		$changes = [
			'added' => [],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_changes__returns_false_when_changes_is_not_array() {
		// Arrange
		$changes = 'not-an-array';

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_changes__returns_false_when_changes_is_null() {
		// Arrange
		$changes = null;

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_has_changes__returns_false_when_changes_has_non_array_values() {
		// Arrange
		$changes = [
			'added' => 'not-an-array',
			'deleted' => 123,
			'modified' => null,
		];

		// Act
		$result = $this->changes_service->has_changes( $changes );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_build_response_data__returns_correct_structure_without_validation_result() {
		// Arrange
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [ 'g-3' ],
			'modified' => [ 'g-4' ],
		];

		// Act
		$result = $this->changes_service->build_response_data( $changes );

		// Assert
		$this->assertArrayHasKey( 'message', $result );
		$this->assertArrayHasKey( 'added_count', $result );
		$this->assertArrayHasKey( 'modified_count', $result );
		$this->assertArrayHasKey( 'deleted_count', $result );
		$this->assertEquals( 'Global classes saved successfully.', $result['message'] );
		$this->assertEquals( 2, $result['added_count'] );
		$this->assertEquals( 1, $result['modified_count'] );
		$this->assertEquals( 1, $result['deleted_count'] );
	}

	public function test_build_response_data__returns_correct_structure_with_validation_result() {
		// Arrange
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [],
			'modified' => [],
		];

		$validation_result = [
			'message' => 'Modified 1 duplicate labels automatically.',
			'meta' => [
				'modifiedLabels' => [
					[
						'original' => 'duplicate-label',
						'modified' => 'DUP_duplicate-label1',
						'id' => 'g-1',
					],
				],
			],
		];

		// Act
		$result = $this->changes_service->build_response_data( $changes, $validation_result );

		// Assert
		$this->assertArrayHasKey( 'code', $result );
		$this->assertArrayHasKey( 'message', $result );
		$this->assertArrayHasKey( 'modifiedLabels', $result );
		$this->assertArrayHasKey( 'duplicate_labels_handled', $result );
		$this->assertEquals( 'DUPLICATED_LABEL', $result['code'] );
		$this->assertEquals( 'Modified 1 duplicate labels automatically.', $result['message'] );
		$this->assertEquals( 1, $result['duplicate_labels_handled'] );
		$this->assertCount( 1, $result['modifiedLabels'] );
	}

	public function test_build_response_data__handles_missing_changes_keys() {
		// Arrange
		$changes = [
			'added' => [ 'g-1' ],
			// missing 'deleted' and 'modified' keys
		];

		// Act
		$result = $this->changes_service->build_response_data( $changes );

		// Assert
		$this->assertEquals( 1, $result['added_count'] );
		$this->assertEquals( 0, $result['modified_count'] );
		$this->assertEquals( 0, $result['deleted_count'] );
	}

	public function test_build_response_data__handles_empty_validation_result() {
		// Arrange
		$changes = [
			'added' => [ 'g-1' ],
			'deleted' => [],
			'modified' => [],
		];

		$validation_result = [
			'message' => '',
			'meta' => [
				'modifiedLabels' => [],
			],
		];

		// Act
		$result = $this->changes_service->build_response_data( $changes, $validation_result );

		// Assert
		$this->assertArrayNotHasKey( 'code', $result );
		$this->assertArrayNotHasKey( 'modifiedLabels', $result );
		$this->assertArrayNotHasKey( 'duplicate_labels_handled', $result );
		$this->assertEquals( 'Global classes saved successfully.', $result['message'] );
	}

	public function test_build_response_meta__returns_correct_total_changes() {
		// Arrange
		$changes = [
			'added' => [ 'g-1', 'g-2' ],
			'deleted' => [ 'g-3' ],
			'modified' => [ 'g-4', 'g-5' ],
		];

		// Act
		$result = $this->changes_service->build_response_meta( $changes );

		// Assert
		$this->assertArrayHasKey( 'total_changes', $result );
		$this->assertEquals( 5, $result['total_changes'] ); // 2 + 1 + 2
	}

	public function test_build_response_meta__handles_missing_changes_keys() {
		// Arrange
		$changes = [
			'added' => [ 'g-1' ],
			// missing 'deleted' and 'modified' keys
		];

		// Act
		$result = $this->changes_service->build_response_meta( $changes );

		// Assert
		$this->assertEquals( 1, $result['total_changes'] );
	}

	public function test_build_response_meta__handles_empty_arrays() {
		// Arrange
		$changes = [
			'added' => [],
			'deleted' => [],
			'modified' => [],
		];

		// Act
		$result = $this->changes_service->build_response_meta( $changes );

		// Assert
		$this->assertEquals( 0, $result['total_changes'] );
	}

	public function test_build_response_meta__handles_null_changes() {
		// Arrange
		$changes = null;

		// Act
		$result = $this->changes_service->build_response_meta( $changes );

		// Assert
		$this->assertEquals( 0, $result['total_changes'] );
	}
}

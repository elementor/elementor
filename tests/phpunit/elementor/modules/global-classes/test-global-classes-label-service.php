<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Services\Global_Classes_Label_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Label_Service extends Elementor_Test_Base {

	private $label_service;

	public function setUp(): void {
		parent::setUp();
		$this->label_service = new Global_Classes_Label_Service();
	}

	public function test_generate_unique_label__adds_prefix_to_new_label() {
		// Arrange
		$original_label = 'test-label';
		$existing_labels = [ 'existing-label' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label', $result );
	}

	public function test_generate_unique_label__handles_duplicate_without_prefix() {
		// Arrange
		$original_label = 'test-label';
		$existing_labels = [ 'test-label', 'other-label' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label1', $result );
	}

	public function test_generate_unique_label__handles_multiple_duplicates() {
		// Arrange
		$original_label = 'test-label';
		$existing_labels = [ 'test-label', 'DUP_test-label1', 'DUP_test-label2' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label3', $result );
	}

	public function test_generate_unique_label__handles_label_with_existing_prefix() {
		// Arrange
		$original_label = 'DUP_test-label';
		$existing_labels = [ 'DUP_test-label', 'other-label' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label1', $result );
	}

	public function test_generate_unique_label__handles_multiple_duplicates_with_existing_prefix() {
		// Arrange
		$original_label = 'DUP_test-label';
		$existing_labels = [ 'DUP_test-label', 'DUP_test-label1', 'DUP_test-label2' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label3', $result );
	}

	public function test_generate_unique_label__respects_max_length_limit() {
		// Arrange
		$original_label = str_repeat( 'a', 50 ); // 50 characters
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
		$this->assertStringStartsWith( 'DUP_', $result );
	}

	public function test_generate_unique_label__handles_very_long_label() {
		// Arrange
		$original_label = str_repeat( 'a', 100 ); // 100 characters
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
		$this->assertStringStartsWith( 'DUP_', $result );
		$this->assertStringEndsWith( '1', $result );
	}

	public function test_generate_unique_label__handles_long_label_with_existing_prefix() {
		// Arrange
		$original_label = 'DUP_' . str_repeat( 'a', 100 ); // DUP_ + 100 characters
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
		$this->assertStringStartsWith( 'DUP_', $result );
		$this->assertStringEndsWith( '1', $result );
	}

	public function test_generate_unique_label__handles_empty_original_label() {
		// Arrange
		$original_label = '';
		$existing_labels = [ 'existing-label' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_', $result );
	}

	public function test_generate_unique_label__handles_empty_existing_labels() {
		// Arrange
		$original_label = 'test-label';
		$existing_labels = [];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label', $result );
	}

	public function test_generate_unique_label__handles_duplicate_in_current_request() {
		// Arrange
		$original_label = 'test-label';
		$existing_labels = [ 'other-label' ];

		// Act - First call
		$result1 = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Add the result to existing labels and call again
		$existing_labels[] = $result1;
		$result2 = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label', $result1 );
		$this->assertEquals( 'DUP_test-label1', $result2 );
	}

	public function test_generate_unique_label__handles_special_characters() {
		// Arrange
		$original_label = 'test-label-with-special-chars!@#$%^&*()';
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertStringStartsWith( 'DUP_', $result );
		$this->assertStringEndsWith( '1', $result );
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
	}

	public function test_generate_unique_label__handles_unicode_characters() {
		// Arrange
		$original_label = 'test-label-with-unicode-ñáéíóú';
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertStringStartsWith( 'DUP_', $result );
		$this->assertStringEndsWith( '1', $result );
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
	}

	public function test_generate_unique_label__handles_numbers_in_label() {
		// Arrange
		$original_label = 'test-label-123';
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label-1231', $result );
	}

	public function test_generate_unique_label__handles_label_ending_with_number() {
		// Arrange
		$original_label = 'test-label1';
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_test-label11', $result );
	}

	public function test_generate_unique_label__handles_case_sensitive_duplicates() {
		// Arrange
		$original_label = 'Test-Label';
		$existing_labels = [ 'test-label', 'TEST-LABEL' ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 'DUP_Test-Label1', $result );
	}

	public function test_generate_unique_label__handles_exact_length_label() {
		// Arrange
		$original_label = str_repeat( 'a', 46 ); // 46 characters (DUP_ = 4, so total = 50)
		$existing_labels = [ $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertEquals( 50, strlen( $result ) );
		$this->assertEquals( 'DUP_' . $original_label, $result );
	}

	public function test_generate_unique_label__handles_exact_length_label_with_duplicate() {
		// Arrange
		$original_label = str_repeat( 'a', 46 ); // 46 characters
		$existing_labels = [ $original_label, 'DUP_' . $original_label ];

		// Act
		$result = $this->label_service->generate_unique_label( $original_label, $existing_labels );

		// Assert
		$this->assertLessThanOrEqual( 50, strlen( $result ) );
		$this->assertStringStartsWith( 'DUP_', $result );
		$this->assertStringEndsWith( '1', $result );
	}
}

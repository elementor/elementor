<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Testing\Exceptions\Expectation_Exception;
use Elementor\Core\Utils\Testing\Expectation;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Expectation extends Elementor_Test_Base {
	public function test_initialization_subject_assigned_to_class() {
		// Arrange
		$subject = 'test-subject';

		// Act
		$expectation = new Expectation( $subject );

		// Assert
		$this->assertEqualFields( $expectation, compact( 'subject' ) );
	}

	public function test_initialization_throws_exception_when_subject_is_not_provided() {
		// Assert
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Expectation has to be introduced with a subject to be inspected.' );

		// Act
		new Expectation();
	}

	public function test_initialization_does_not_throws_error_when_subject_is_null() {
		// Arrange
		$subject = null;

		// Act
		new Expectation( $subject );

		// Assert
		$this->expectNotToPerformAssertions();
	}

	public function test_description_assigned_to_class() {
		// Arrange
		$description = 'test-description';

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->description( $description );

		// Assert
		$this->assertEqualFields( $expectation, compact( 'description' ) );
	}

	public function test_to_meet_closure_assigned_to_class() {
		// Arrange
		$closure = function() {
			return 'test-closure';
		};

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->to_meet( $closure );

		// Assert
		$this->assertEquals( $expectation->closure, $closure );
	}

	public function test_to_meet_throws_exception_when_constraint_has_already_been_set() {
		// Assert
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessage( 'An expectation constraint has already been set.' );

		// Arrange
		$closure = function() {
			return 'test-closure';
		};

		// Act
		( new Expectation( 'test-subject' ) )
			->to_meet( $closure )
			->to_meet( $closure );
	}

	public function test_inspect_set_result_when_inspection_succeeded() {
		// Arrange
		$closure = function( $subject ) {
			return true;
		};

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->to_meet( $closure );

		$expectation->inspect();

		// Assert
		$this->assertEqualFields( $expectation, [ 'result' => true ] );
	}

	public function test_inspect_throws_exception_when_inspection_failed() {
		// Assert
		$this->expectException( Expectation_Exception::class );

		// Arrange
		$closure = function( $subject ) {
			return false;
		};

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->to_meet( $closure );

		$expectation->inspect();
	}

	public function test_inspect_closure_provided_with_subject() {
		// Arrange
		$subject = 'test-subject';
		$closure = function( $provided_subject ) use( $subject ) {
			// Assert
			$this->assertEquals( $subject, $provided_subject );
			return true;
		};

		// Act
		$expectation = ( new Expectation( $subject ) )
			->to_meet( $closure );

		$expectation->inspect();
	}
}

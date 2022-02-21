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

	public function test_get_name_return_description_when_set() {
		// Arrange
		$description = 'test-description';

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->describe( $description );

		// Assert
		$this->assertEquals( $expectation->get_name(), $description );
	}

	public function test_get_name_return_suitable_text_when_description_is_not_set() {
		// Arrange
		$expectation = new Expectation( 'test-subject' );

		// Assert
		$this->assertEquals( $expectation->get_name(), '(no description)' );
	}

	public function test_describe_text_assigned_to_class() {
		// Arrange
		$description = 'test-description';

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->describe( $description );

		// Assert
		$this->assertEqualFields( $expectation, compact( 'description' ) );
	}

	public function test_to_meet_closure_invoked_with_subject() {
		// Arrange
		$subject = 'test-subject';

		// Assert
		$closure = function( $given_subject ) use( $subject ) {
			$this->assertEquals( $subject, $given_subject );
			return true;
		};

		// Act
		( new Expectation( $subject ) )
			->to_meet( $closure );
	}

	public function test_to_meet_set_result_when_inspection_succeeded() {
		// Arrange
		$closure = function( $subject ) {
			return true;
		};

		// Act
		$expectation = ( new Expectation( 'test-subject' ) )
			->to_meet( $closure );

		// Assert
		$this->assertEquals( null, $expectation->error() );
	}

	public function test_to_meet_set_result_when_inspection_failed() {
		// Arrange
		$closure = function( $subject ) {
			return false;
		};
		$expectation = ( new Expectation( 'test-subject' ) );

		// Act
		try{
			$expectation->to_meet( $closure );
		} catch( \Exception $e ) {}

		// Assert
		$this->assertInstanceOf( \Exception::class, $expectation->error() );
	}

	public function test_to_meet_throws_exception_when_inspection_failed() {
		// Arrange
		$closure = function( $subject ) {
			return false;
		};
		$expectation = ( new Expectation( 'test-subject' ) );

		// Assert
		$this->expectException( Expectation_Exception::class );
		$this->expectExceptionMessage( 'Failed to assert that the subject meets with the given callback.' );

		// Act
		$expectation->to_meet( $closure );
	}

	public function test_to_meet_assign_exception_to_class_when_inspection_failed() {
		// Arrange
		$closure = function( $subject ) {
			return false;
		};
		$expectation = ( new Expectation( 'test-subject' ) );

		// Act
		try{
			$expectation->to_meet( $closure );
		} catch( \Exception $e ) {}


		// Assert
		$this->assertEquals(
			new Expectation_Exception( 'Failed to assert that the subject meets with the given callback.' ),
			$expectation->error()
		);
	}
}

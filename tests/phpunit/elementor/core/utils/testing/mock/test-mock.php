<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\Mock;

use Elementor\Core\Utils\Testing\Test;

class Test_Mock extends Test {

	public function test_some_case_with_success_single_expectation() {
		// Arrange
		$subject = 'test-subject';

		// Assert
		$this->expect( $subject )
			->to_meet( function( $examined_subject ) use( $subject ) {
				return $examined_subject === $subject;
			} );
	}

	public function test_some_case_with_success_multiple_expectations() {
		// Arrange
		$subject = 'test-subject';

		// Assert
		for( $i = 0; $i < 3; $i++ ) {
			$this->expect( $subject )
			     ->to_meet( function( $examined_subject ) use( $subject ) {
				     return $examined_subject === $subject;
			     } );
		}
	}

	public function test_some_case_without_any_expectations() {}

	public function test_some_case_with_failure_single_expectation() {
		// Arrange
		$subject = 'test-subject';

		// Assert
		$this->expect( $subject )
		     ->to_meet( function( $examined_subject ) use( $subject ) {
			     return $examined_subject !== $subject;
		     } );
	}

	public function test_some_case_with_failure_multiple_expectation() {
		// Arrange
		$subject = 'test-subject';

		// Assert
		for( $i = 0; $i < 3; $i++ ) {
			$this->expect( $subject )
			     ->to_meet( function( $examined_subject ) use( $subject ) {
				     return $examined_subject !== $subject;
			     } );
		}
	}

	public function test_some_case_with_error() {
		throw new \Exception( 'test-exception' );
	}
}

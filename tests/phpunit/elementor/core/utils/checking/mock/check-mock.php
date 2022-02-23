<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking\Mock;

use Elementor\Core\Utils\Checking\Check;

class Check_Mock extends Check {

	public function check_some_case_with_success_single_expectation() {
		// Arrange
		$subject = 'check-subject';

		// Assert
		$this->expect( $subject )
			->to_meet( function( $examined_subject ) use( $subject ) {
				return $examined_subject === $subject;
			} );
	}

	public function check_some_case_with_success_multiple_expectations() {
		// Arrange
		$subject = 'check-subject';

		// Assert
		for( $i = 0; $i < 3; $i++ ) {
			$this->expect( $subject )
			     ->to_meet( function( $examined_subject ) use( $subject ) {
				     return $examined_subject === $subject;
			     } );
		}
	}

	public function check_some_case_without_any_expectations() {}

	public function check_some_case_with_failure_single_expectation() {
		// Arrange
		$subject = 'check-subject';

		// Assert
		$this->expect( $subject )
		     ->to_meet( function( $examined_subject ) use( $subject ) {
			     return $examined_subject !== $subject;
		     } );
	}

	public function check_some_case_with_failure_multiple_expectation() {
		// Arrange
		$subject = 'check-subject';

		// Assert
		for( $i = 0; $i < 3; $i++ ) {
			$this->expect( $subject )
			     ->to_meet( function( $examined_subject ) use( $subject ) {
				     return $examined_subject !== $subject;
			     } );
		}
	}

	public function check_some_case_with_error() {
		throw new \Exception( 'check-exception' );
	}
}

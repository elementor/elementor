<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Checking\Exceptions\Check_Case_Exception;
use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Checking\Exceptions\Check_Exception;
use Elementor\Core\Utils\Checking\Expectation;
use Elementor\Core\Utils\Checking\Check;
use Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking\Mock\Check_Mock;
use PHPUnit\Runner\Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Check extends Checking_Test_Base {

	public function test_run_throws_exception_when_there_are_no_check_methods() {
		// Arrange
		$check = $this->create_abstract_check_mock();

		// Assert
		$this->expectException( Check_Exception::class );
		$this->expectExceptionMessage( 'A check should describe at least one check-case.' );

		// Act
		$check->run();
	}

	public function test_run_invokes_check_cases() {
		// Arrange
		$check_methods = [
			'check_some_case_with_success_single_expectation',
			'check_some_case_with_success_multiple_expectations',
		];
		$check = $this->create_check_mock( $check_methods, [ [ 'min_expectations' => 0 ] ]  );

		// Assert
		foreach( $check_methods as $check_method ) {
			$check->expects( $this->once() )
			     ->method( $check_method );
		}

		// Act
		$check->run();
	}

	/**
	 * @doesNotPerformAssertions
	 */
	public function test_run_does_not_throw_exception_when_stop_on_error_is_off() {
		// Arrange
		$check = $this->create_check_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$check->run();
	}

	public function test_run_throws_exception_when_stop_on_error_is_on() {
		// Arrange
		$check = $this->create_check_mock( [], [ [ 'min_expectations' => 0, 'stop_on_error' => true ] ] );
		$exception_message = 'check-exception';

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( $exception_message );

		// Act
		$check->run();
	}

	/**
	 * @doesNotPerformAssertions
	 */
	public function test_run_does_not_throw_exception_when_stop_on_failure_off() {
		// Arrange
		$check = $this->create_check_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$check->run();
	}

	public function test_run_throws_exception_when_stop_on_failure_on() {
		// Arrange
		$check = $this->create_check_mock( [], [ [ 'min_expectations' => 0, 'stop_on_failure' => true ] ] );

		// Assert
		$this->expectException( Check_Exception::class );

		// Act
		$check->run();
	}
}

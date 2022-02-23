<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Checking\Exceptions\Check_Case_Exception;
use Elementor\Core\Utils\Checking\Exceptions\Check_Exception;
use Elementor\Core\Utils\Checking\Expectation;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Check_Case extends Checking_Test_Base {

	public function test_check_throws_exception_when_check_method_does_not_exists() {
		// Assert
		$this->expectException( Check_Case_Exception::class );
		$this->expectExceptionMessageRegExp( '/The check-case \`.*\` is not exists in check \`.*\`./' );

		// Arrange
		$check = $this->create_abstract_check_mock();

		// Act
		$check->check( 'check_unavailable_method' );
	}

	public function test_check_inspects_single_expectation() {
		// Arrange
		$check = $this->create_check_mock();
		$check_method = 'check_some_case_with_success_single_expectation';

		// Act
		$check->check( $check_method );

		// Assert
		$this->assertEquals( 1, count( $check->get_diagnosables()[ 0 ]->get_diagnosables() ) );
	}

	public function test_check_inspects_multiple_expectations() {
		// Arrange
		$check = $this->create_check_mock();
		$check_method = 'check_some_case_with_success_multiple_expectations';

		// Act
		$check->check( $check_method );

		// Assert
		$this->assertEquals( 3, count( $check->get_diagnosables()[ 0 ]->get_diagnosables() ) );
	}

	public function test_check_throws_exception_when_there_are_no_expectations() {
		// Arrange
		$check = $this->create_check_mock();
		$check_method = 'check_some_case_without_any_expectations';

		// Assert
		$this->expectException( Check_Case_Exception::class );
		$this->expectExceptionMessageRegExp(
			'/The check-case `.*` doesn\'t contain any expectations in check `.*`/'
		);

		// Act
		$check->check( $check_method );
	}

	public function test_check_throws_exception_when_single_expectation_inspection_fails() {
		// Arrange
		$check = $this->create_check_mock();
		$check_method = 'check_some_case_with_failure_single_expectation';

		// Assert
		$this->expectException( Check_Case_Exception::class );

		// Act
		$check->check( $check_method );
	}

	public function test_check_throws_exception_when_multiple_expectations_inspection_fails() {
		// Arrange
		$check = $this->create_check_mock();
		$check_method = 'check_some_case_with_failure_multiple_expectation';

		// Assert
		$this->expectException( Check_Case_Exception::class );

		// Act
		$check->check( $check_method );
	}
}

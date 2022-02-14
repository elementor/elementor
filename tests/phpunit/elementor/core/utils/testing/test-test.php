<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Testing\Exceptions\Test_Exception;
use Elementor\Core\Utils\Testing\Expectation;
use Elementor\Core\Utils\Testing\Test;
use Elementor\Tests\Phpunit\Elementor\Core\Utils\Mock\Test_Mock;
use ElementorEditorTesting\Elementor_Test_Base;
use PHPUnit\Runner\Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Test extends Elementor_Test_Base {

	const TEST_MOCK_CLASS_NAME = 'Test_Mock';

	public function test_test_throws_exception_when_test_method_does_not_exists() {
		// Assert
		$this->expectException( \DomainException::class );
		$this->expectExceptionMessageRegExp( '/The test-case \`.*\` is not exists in test \`.*\`./' );

		// Arrange
		$test = $this->create_abstract_test_mock();

		// Act
		$test->test( 'test_unavailable_method' );
	}

	public function test_test_inspects_test_case_single_expectation() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_success_single_expectation';

		// Act
		$test->test( $test_method );

		// Assert
		$this->assertEquals( 1, count( $test->get_expectations( $test_method ) ) );
	}

	public function test_test_inspects_test_case_multiple_expectations() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_success_multiple_expectations';

		// Act
		$test->test( $test_method );

		// Assert
		$this->assertEquals( 3, count( $test->get_expectations( $test_method ) ) );
	}

	/**
	 * @doesNotPerformAssertions
	 */
	public function test_test_does_not_throw_exception_when_stop_on_error_is_off() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );
		$test_method = 'test_some_case_with_error';

		// Act
		$test->test( $test_method );
	}

	public function test_test_throws_exception_when_stop_on_error_is_on() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0, 'stop_on_error' => true ] ] );
		$test_method = 'test_some_case_with_error';
		$exception_message = 'test-exception';

		// Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( $exception_message );

		// Act
		$test->test( $test_method );
	}

	public function test_test_throws_exception_when_there_are_no_expectations() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_without_any_expectations';

		// Assert
		$this->expectException( \LogicException::class );
		$this->expectExceptionMessageRegExp(
			'/The test-case `.*` doesn\'t contain any expectations in test `.*`./'
		);

		// Act
		$test->test( $test_method );
	}

	public function test_test_throws_exception_when_single_expectation_inspection_fails() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_failure_single_expectation';

		// Assert
		$this->expectException( Test_Exception::class );

		// Act
		$test->test( $test_method );
	}

	public function test_test_throws_exception_when_multiple_expectations_inspection_fails() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_failure_multiple_expectation';

		// Assert
		$this->expectException( Test_Exception::class );

		// Act
		$test->test( $test_method );
	}

	public function test_run_throws_exception_when_there_are_no_test_methods() {
		// Arrange
		$test = $this->create_abstract_test_mock();

		// Assert
		$this->expectException( \LogicException::class );
		$this->expectExceptionMessage( 'A test should describe at least one test-case.' );

		// Act
		$test->run();
	}

	public function test_run_invokes_test_cases() {
		// Arrange
		$test_methods = [
			'test_some_case_with_success_single_expectation',
			'test_some_case_with_success_multiple_expectations',
		];
		$test = $this->create_test_mock( $test_methods, [ [ 'min_expectations' => 0 ] ]  );

		// Assert
		foreach( $test_methods as $test_method ) {
			$test->expects( $this->once() )
			     ->method( $test_method );
		}

		// Act
		$test->run();
	}

	/**
	 * @doesNotPerformAssertions
	 */
	public function test_run_does_not_throw_exception_when_stop_on_failure_off() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$test->run();
	}

	public function test_run_throws_exception_when_stop_on_failure_on() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0, 'stop_on_failure' => true ] ] );

		// Assert
		$this->expectException( Test_Exception::class );

		// Act
		$test->run();
	}

	public function test_get_expectations_returns_registered_expectations_per_test_case() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$test->run();
		$expectations = $test->get_expectations();

		// Assert

		// On single expectation test-case
		$this->assertInstanceOf(
			Expectation::class,
			$expectations[ 'test_some_case_with_success_single_expectation' ][ 0 ]
		);

		// On multiple expectations test-case
		foreach( $expectations[ 'test_some_case_with_success_multiple_expectations' ] as $expectation ) {
			$this->assertInstanceOf(
				Expectation::class,
				$expectation
			);
		}
	}

	public function test_get_expectations_returns_registered_expectations_given_specific_test_case() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_success_multiple_expectations';

		// Act
		$test->test( $test_method );
		$expectations = $test->get_expectations( $test_method );

		// Assert
		foreach( $expectations as $expectation ) {
			$this->assertInstanceOf(
				Expectation::class,
				$expectation
			);
		}
	}

	public function test_get_expectations_returns_empty_array_when_no_expectations_registered() {
		// Arrange
		$test = $this->create_test_mock();

		// Assert
		$this->assertEquals( [], $test->get_expectations() );
	}

	public function test_get_expectations_returns_empty_array_when_no_expectations_registered_given_specific_test_case() {
		// Arrange
		$test = $this->create_test_mock();
		$test_method = 'test_some_case_with_success_single_expectation';

		// Assert
		$this->assertEquals( [], $test->get_expectations( $test_method ) );
	}

	public function test_has_expectations_returns_true_when_there_are_expectations() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$test->run();

		// Assert
		$this->assertEquals( true, $test->has_expectations() );
	}

	public function test_has_expectations_returns_false_when_there_are_no_expectations() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Assert
		$this->assertEquals( false, $test->has_expectations() );
	}

	public function test_has_expectations_returns_true_when_there_are_expectations_given_specific_test_case() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );

		// Act
		$test->run();
		$expectations = $test->get_expectations();

		// Assert

		// On single expectation test-case
		$this->assertInstanceOf(
			Expectation::class,
			$expectations[ 'test_some_case_with_success_single_expectation' ][ 0 ]
		);

		// On multiple expectations test-case
		foreach( $expectations[ 'test_some_case_with_success_multiple_expectations' ] as $expectation ) {
			$this->assertInstanceOf(
				Expectation::class,
				$expectation
			);
		}
	}

	public function test_has_expectations_returns_false_when_there_are_no_expectations_given_specific_test_case() {
		// Arrange
		$test = $this->create_test_mock( [], [ [ 'min_expectations' => 0 ] ] );
		$test_case = 'test_some_case_with_success_single_expectation';

		// Assert
		$this->assertEquals( false, $test->has_expectations( $test_case ) );
	}

	public function create_abstract_test_mock( $class_name = self::TEST_MOCK_CLASS_NAME, $mocked_methods = [], $constructor_args = [] ) {
		$class = $this->getMockForAbstractClass(
			Test::class,
			[],
			$class_name,
			true, true, true,
			$mocked_methods
		);

		$class->__constructor( ...$constructor_args );

		return $class;
	}

	public function create_test_mock( $mocked_methods = [], $constructor_args = [] ) {
		$class = $this->getMockBuilder( Test_Mock::class )
			->enableProxyingToOriginalMethods()
			->setMethods( $mocked_methods )
			->getMock();

		$class->__constructor( ...$constructor_args );

		return $class;
	}
}

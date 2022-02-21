<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Testing\Exceptions\Expectation_Exception;
use Elementor\Core\Utils\Testing\Exceptions\Test_Case_Exception;
use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

class Test_Case implements Diagnosable {

	/**
	 * The prefix to distinguish the test-case methods among the rest.
	 */
	const TEST_CASE_PREFIX = 'test';

	/**
	 * A test in which this test-case is a test-method.
	 *
	 * @var Test
	 */
	protected $test;

	/**
	 * A test's method (single test-case) instance that this class represents.
	 *
	 * @var \ReflectionMethod
	 */
	protected $method;

	/**
	 * A list of Expectation instances to be inspected during test run.
	 *
	 * @var Expectation[]
	 */
	protected $expectations = [];

	/**
	 * An exception from last failure of the invocation (if failed).
	 *
	 * @var \Exception
	 */
	protected $exception;

	/**
	 * The Test_Case constructor.
	 *
	 * @param Test                     $test
	 * @param \ReflectionMethod|string $method
	 *
	 * @return void
	 * @throws Test_Case_Exception
	 */
	public function __construct( $test, $method ) {
		$method_name = $method instanceof \ReflectionMethod ?
			$method->name :
			$method;

		try {
			$method = ( new \ReflectionClass( $test ) )
				->getMethod( $method_name );
		} catch( \ReflectionException $e ) {
			throw new Test_Case_Exception(
				sprintf(
					'The test-case `%s` is not exists in test `%s`.',
					$method_name,
					$this->test->get_test_class()
				)
			);
		}

		$this->test = $test;
		$this->method = $method;
	}

	/**
	 * @inheritDoc
	 */
	public function get_name() {
		return Str::to_title_case( $this->method->name );
	}

	/**
	 * Get all registered expectation instances.
	 *
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return $this->expectations;
	}

	/**
	 * Run the test-case and inspect its expectations.
	 *
	 * @return static
	 * @throws \Exception|Test_Case_Exception
	 */
	public function test() {
		try {
			try {
				// Execute test-case and register its expectations.
				$this->method->invoke( $this->test );
			} catch( Expectation_Exception $e ) {
				throw new Test_Case_Exception();
			}

			if ( count( $this->expectations ) < $this->test->configuration->min_expectations ) {
				throw new Test_Case_Exception(
					sprintf(
						'The test-case `%s` doesn\'t contain any expectations in test `%s`',
						$this->method->name,
						$this->test->get_test_class()
					)
				);
			}
		} catch( \Exception $e ) {
			// Generally assign the thrown exception to the class to indicate failure
			throw $this->exception = $e;
		}

		return $this;
	}

	/**
	 * Create a new Expectation instance and link it to the test.
	 *
	 * @param mixed $subject
	 *
	 * @return Expectation
	 * @throws \Exception
	 */
	public function expect( $subject = null ) {
		// Return the currently added expectation instance.
		return $this->expectations[] = new Expectation(
			// Sometimes the expectation can assert subject to be null, and therefore argument presence validation
			// should relay on `func_num_args` and on its equality to null.
			func_num_args() ?
				$subject :
				// If not provided, expectation will inspect the default subject.
				$this->test->configuration->subject
		);
	}

	/**
	 * @inheritDoc
	 */
	public function error() {
		return $this->exception;
	}

	/**
	 * Check whether a method is a test case by its name.
	 *
	 * @param \ReflectionMethod|string $method
	 *
	 * @return bool
	 */
	public static function is_test_case( $method ) {
		return ! empty( preg_grep( '/^' . static::TEST_CASE_PREFIX . '.+/', [
			is_string( $method ) ? $method : $method->name
		] ) );
	}
}

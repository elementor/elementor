<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Testing\Exceptions\Expectation_Exception;
use Elementor\Core\Utils\Testing\Exceptions\Test_Exception;

abstract class Test {

	/**
	 * The prefix to distinguish the test-case methods among the rest.
	 */
	const TEST_CASE_PREFIX = 'test';

	/**
	 * A Configuration instance with customized options regarding the test.
	 *
	 * @var Configuration
	 */
	protected $configuration;

	/**
	 * A list of Expectation instances to be inspected during test run.
	 *
	 * @var Expectation[][]
	 */
	protected $expectations = [];

	/**
	 * The Test constructor.
	 *
	 * @param Configuration|array $configuration
	 *
	 * @return void
	 * @throws \Exception
	 */
	public function __constructor( $configuration = null ) {
		$this->configuration = Configuration::create( $configuration );
	}

	/**
	 * Run all tests cases inspecting their expectations.
	 *
	 * @return void
	 * @throws Test_Exception|\LogicException
	 */
	public function run() {
		$test_methods = $this->get_test_methods();

		if ( empty( $test_methods ) ) {
			throw new \LogicException( 'A test should describe at least one test-case.' );
		}

		foreach( $test_methods as $test_method ) {
			try {
				$this->test( $test_method );
			} catch ( Test_Exception $e ) {
				if ( $this->configuration->stop_on_failure ) {
					throw $e;
				}
			}
		}
	}

	/**
	 * Run a specific test case inspecting its expectations.
	 *
	 * @param $test_method
	 *
	 * @return void
	 * @throws \LogicException|\DomainException|Test_Exception
	 */
	public function test( $test_method ) {
		$test_class = $this->get_test_class();

		if ( ! method_exists( $test_class, $test_method ) ) {
			throw new \DomainException(
				"The test-case `$test_method` is not exists in test `$test_class`."
			);
		}

		try {
			// Execute test case expectations.
			call_user_func( [ $this, $test_method ] );
		} catch ( Expectation_Exception $e ) {
			throw new Test_Exception();
		} catch ( \Exception $e ) {
			if ( $this->configuration->stop_on_error ) {
				throw $e;
			}
		}

		if ( count( $this->get_expectations( $test_method ) ) < $this->configuration->min_expectations ) {
			throw new \LogicException(
				"The test-case `$test_method` doesn't contain any expectations in test `$test_class`."
			);
		}
	}

	/**
	 * Get all registered expectation, or expectation from a specific test-case if specified.
	 *
	 * @param string $test_method
	 *
	 * @return Expectation[]|Expectation[][]
	 */
	public function get_expectations( $test_method = null ) {
		if ( $test_method ) {
			return $this->has_expectations( $test_method ) ?
				$this->expectations[ $test_method ] :
				[];
		}

		return $this->expectations;
	}

	/**
	 * Whether there are expectations in general, or in a specific test-case if specified.
	 *
	 * @param string $test_method
	 *
	 * @return bool
	 */
	public function has_expectations( $test_method = null ) {
		if ( $test_method ) {
			return array_key_exists( $test_method, $this->expectations );
		}

		return ! empty( $this->expectations );
	}

	/**
	 * Create a new Expectation instance and link it to the test.
	 *
	 * @param mixed $subject
	 *
	 * @return Expectation
	 * @throws \Exception
	 */
	protected function expect( $subject = null, $test_method = null ) {
		if ( ! $test_method ) {
			$test_method = debug_backtrace()[ 1 ][ 'function' ];
		}

		if ( ! static::is_test_method( $test_method ) ) {
			throw new \Exception(
				"The test-case `$test_method` should be prefixed with `" . static::TEST_CASE_PREFIX . '`.'
			);
		} else if ( ! $this->has_expectations( $test_method ) ) {
			$this->expectations[ $test_method ] = [];
		}

		$expectation = new Expectation(
			// Sometimes the expectation can assert subject to be null, and therefore argument presence validation
			// should relay on `func_num_args` and on its equality to null.
			func_num_args() ?
				$subject :
				$this->configuration->subject // If not provided, expectation will inspect the default subject - null.
		);

		// Return the currently added expectation instance.
		return $this->expectations[ $test_method ][] = $expectation;
	}

	/**
	 * Get the class representing the test itself.
	 *
	 * @return string
	 */
	protected final function get_test_class() {
		return get_class( $this );
	}

	/**
	 * Get all test cases methods existing in the test class.
	 *
	 * @return string[]
	 */
	protected final function get_test_methods() {
		try {
			$class = new \ReflectionClass(
				$this->get_test_class()
			);
		} catch ( \ReflectionException $e ) {
			// This can only happen if the class provided to the `ReflectionClass` instance is not exists, which is
			// nearly impossible given the `get_test_class` method returns the children class name, and this class is
			// an abstract one.
			throw new \LogicException();
		}

		return array_filter( array_map(
			function( $method ) {
				return static::is_test_method( $method->name ) ?
					$method->name :
					null;
			},
			$class->getMethods()
		) );
	}

	/**
	 * Check whether a method is a test case by its name.
	 *
	 * @param $method
	 *
	 * @return bool
	 */
	protected final static function is_test_method( $method ) {
		return ! empty( preg_grep( '/^' . static::TEST_CASE_PREFIX . '.+/', [ $method ] ) );
	}
}

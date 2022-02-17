<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Testing\Exceptions\Test_Case_Exception;
use Elementor\Core\Utils\Testing\Exceptions\Test_Exception;
use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

abstract class Test implements Diagnosable {

	/**
	 * A Configuration instance with customized options regarding the test.
	 *
	 * @var Configuration
	 */
	public $configuration;

	/**
	 * An exception from last failure of the test (if failed).
	 *
	 * @var \Exception
	 */
	protected $exception;

	/**
	 * A list of test-cases to be invoked by the test.
	 *
	 * @var Test_Case[]
	 */
	protected $cases = [];

	/**
	 * The Test constructor.
	 *
	 * @param Configuration|array $configuration
	 *
	 * @return void
	 * @throws \Exception
	 */
	public function __construct( $configuration = null ) {
		$this->configuration = Configuration::create( $configuration );
	}

	/**
	 * Get a formatted name of the test-class name, which is converted to Title case.
	 *
	 * @inheritDoc
	 */
	public function get_name() {
		$namespace_portions = explode( '\\', $this->get_test_class() );
		return Str::to_title_case( end( $namespace_portions ) );
	}

	/**
	 * Get all registered test-case instances.
	 *
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return $this->cases;
	}

	/**
	 * Run all tests-cases inspecting their expectations.
	 *
	 * @return void
	 * @throws \Exception|Test_Exception|\LogicException
	 */
	public function run() {
		$test_methods = $this->get_test_methods();

		try {
			if ( empty( $test_methods ) ) {
				throw new Test_Exception( 'A test should describe at least one test-case.' );
			}

			foreach( $test_methods as $test_method ) {
				try {
					$this->test( $test_method );
				} catch ( Test_Case_Exception $e ) {
					// In case that a test-case failed, only throw the exception and break the testing workflow when
					// `stop_on_failure` is on.
					if ( $this->configuration->stop_on_failure ) {
						throw new Test_Exception();
					}
				} catch ( \Exception $e ) {
					// In case that a test-case end up with an error, only throw the exception and break the testing
					// workflow when `stop_on_error` is on.
					if ( $this->configuration->stop_on_error ) {
						throw $e;
					}
				}
			}
		} catch( \Exception $e ) {
			// Generally assign the thrown exception to the class to indicate failure.
			throw $this->exception = $e;
		}
	}

	/**
	 * Run a specific test-case while inspecting its expectations.
	 *
	 * @param \ReflectionMethod $test_method
	 *
	 * @return void
	 * @throws \DomainException|Test_Case_Exception
	 */
	public function test( $test_method ) {
		if ( ! array_key_exists( $test_method->name, $this->cases ) ) {
			$this->cases[ $test_method->name ] = new Test_Case( $this, $test_method );
		}

		$this->cases[ $test_method->name ]->test();
	}

	/**
	 * @inheritDoc
	 */
	public function error() {
		return $this->exception;
	}

	/**
	 * Get the class representing the test itself.
	 *
	 * @return string
	 */
	public function get_test_class() {
		return get_class( $this );
	}

	/**
	 * Get all test cases methods existing in the test class.
	 *
	 * @return \ReflectionMethod[]
	 */
	public function get_test_methods() {
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

		return array_filter(
			$class->getMethods(),
			function( $method ) {
				return Test_Case::is_test_case( $method );
			}
		);
	}

	/**
	 * Create a new Expectation instance and link it to the test.
	 *
	 * @param mixed $subject
	 *
	 * @return Expectation
	 * @throws \Exception
	 */
	protected function expect( $subject = null ) {
		$test_method = debug_backtrace()[ 1 ][ 'function' ];

		if ( ! Test_Case::is_test_case( $test_method ) ) {
			throw new \Exception(
				sprintf(
					'The test-case `%s` should be prefixed with `%s`.',
					$test_method,
					Test_Case::TEST_CASE_PREFIX
				)
			);
		}

		// Return the currently added expectation instance.
		return $this->cases[ $test_method ]->expect(
			...func_get_args()
		);
	}
}

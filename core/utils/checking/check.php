<?php

namespace Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Checking\Exceptions\Check_Case_Exception;
use Elementor\Core\Utils\Checking\Exceptions\Check_Exception;

abstract class Check extends Diagnosable {

	/**
	 * A Configuration instance with customized options regarding the check.
	 *
	 * @var Configuration
	 */
	public $configuration;

	/**
	 * A list of check-cases to be invoked by the check.
	 *
	 * @var Array<string, Check_Case>
	 */
	protected $cases = [];

	/**
	 * The Check constructor.
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
	 * Get a formatted name of the check-class name, which is converted to Title case.
	 *
	 * @inheritDoc
	 */
	public function get_name() {
		$namespace_portions = explode( '\\', $this->get_check_class() );
		return Str::to_title_case( end( $namespace_portions ) );
	}

	/**
	 * Get all registered check-case instances.
	 *
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return array_values( $this->cases );
	}

	/**
	 * Run all checks-cases inspecting their expectations.
	 *
	 * @return static
	 * @throws \Exception|Check_Exception|\LogicException
	 */
	public function run() {
		$check_methods = $this->get_check_methods();

		try {
			if ( empty( $check_methods ) ) {
				throw new Check_Exception( 'A check should describe at least one check-case.' );
			}

			foreach ( $check_methods as $check_method ) {
				try {
					$this->check( $check_method );
				} catch ( Check_Case_Exception $e ) {
					// In case that a check-case failed, only throw the exception and break the checking workflow when
					// `stop_on_failure` is on.
					if ( $this->configuration->stop_on_failure ) {
						throw new Check_Exception();
					}
				} catch ( \Exception $e ) {
					// In case that a check-case end up with an error, only throw the exception and break the checking
					// workflow when `stop_on_error` is on.
					if ( $this->configuration->stop_on_error ) {
						throw $e;
					}
				}
			}
		} catch ( \Exception $e ) {
			// Generally assign the thrown exception to the class to indicate failure.
			// phpcs:ignore Squiz.PHP.DisallowMultipleAssignments.Found
			throw $this->exception = $e;
		}

		return $this;
	}

	/**
	 * Get the class representing the check itself.
	 *
	 * @return string
	 */
	public function get_check_class() {
		return get_class( $this );
	}

	/**
	 * Get all check cases methods existing in the check class.
	 *
	 * @return \ReflectionMethod[]
	 */
	public function get_check_methods() {
		try {
			$class = new \ReflectionClass(
				$this->get_check_class()
			);
		} catch ( \ReflectionException $e ) {
			// This can only happen if the class provided to the `ReflectionClass` instance is not exists, which is
			// nearly impossible given the `get_check_class` method returns the children class name, and this class is
			// an abstract one.
			throw new \LogicException();
		}

		return array_filter(
			$class->getMethods(),
			function( $method ) {
				return Check_Case::is_check_case( $method );
			}
		);
	}

	/**
	 * Run a specific check-case while inspecting its expectations.
	 *
	 * @param \ReflectionMethod|string $check_method
	 *
	 * @return void
	 * @throws \DomainException|Check_Case_Exception
	 */
	public function check( $check_method ) {
		$check_method_name = $check_method instanceof \ReflectionMethod ?
			$check_method->name :
			$check_method;

		if ( ! array_key_exists( $check_method_name, $this->cases ) ) {
			$this->cases[ $check_method_name ] = new Check_Case(
				$this,
				// When `check_method` is a string, the `Check_Case` class converts it to a suitable `ReflectionMethod`.
				$check_method
			);
		}

		$this->cases[ $check_method_name ]->check();
	}

	/**
	 * Create a new Expectation instance and link it to the check.
	 *
	 * @param mixed $subject
	 *
	 * @return Expectation
	 * @throws \Exception
	 */
	protected function expect( $subject = null ) {
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
		$check_method = debug_backtrace()[1]['function'];

		// Return the currently added expectation instance.
		return $this->cases[ $check_method ]->expect(
			...func_get_args()
		);
	}
}

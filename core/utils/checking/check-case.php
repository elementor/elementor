<?php

namespace Elementor\Core\Utils\Checking;

use Elementor\Core\Utils\Str;
use Elementor\Core\Utils\Checking\Exceptions\Expectation_Exception;
use Elementor\Core\Utils\Checking\Exceptions\Check_Case_Exception;

class Check_Case extends Diagnosable {

	/**
	 * The prefix to distinguish the check-case methods among the rest.
	 */
	const CHECK_CASE_PREFIX = 'check';

	/**
	 * A check in which this check-case is a check-method.
	 *
	 * @var Check
	 */
	protected $check;

	/**
	 * A check's method (single check-case) instance that this class represents.
	 *
	 * @var \ReflectionMethod
	 */
	protected $method;

	/**
	 * A list of Expectation instances to be inspected during check run.
	 *
	 * @var Expectation[]
	 */
	protected $expectations = [];

	/**
	 * The Check_Case constructor.
	 *
	 * @param Check                    $check
	 * @param \ReflectionMethod|string $method
	 *
	 * @return void
	 * @throws \Exception
	 * @throws Check_Case_Exception
	 */
	public function __construct( $check, $method ) {
		$this->check = $check;

		$this->set_method( $method );
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
	 * Run the check-case and inspect its expectations.
	 *
	 * @return static
	 * @throws \Exception|Check_Case_Exception
	 */
	public function check() {
		try {
			try {
				// Execute check-case and register its expectations.
				$this->method->invoke( $this->check );
			} catch ( Expectation_Exception $e ) {
				throw new Check_Case_Exception();
			}

			if ( count( $this->expectations ) < $this->check->configuration->min_expectations ) {
				throw new Check_Case_Exception(
					sprintf(
						'The check-case `%s` doesn\'t contain any expectations in check `%s`',
						$this->method->name,
						$this->check->get_check_class()
					)
				);
			}
		} catch ( \Exception $e ) {
			// Generally assign the thrown exception to the class to indicate failure
			// phpcs:ignore Squiz.PHP.DisallowMultipleAssignments.Found
			throw $this->exception = $e;
		}

		return $this;
	}

	/**
	 * Create a new Expectation instance and link it to the check.
	 *
	 * @param mixed $subject
	 *
	 * @return Expectation
	 * @throws \Exception
	 */
	public function expect( $subject = null ) {
		// Return the currently added expectation instance.
		// phpcs:ignore Squiz.PHP.DisallowMultipleAssignments.Found
		return $this->expectations[] = new Expectation(
			// Sometimes the expectation can assert subject to be null, and therefore argument presence validation
			// should relay on `func_num_args` and on its equality to null.
			func_num_args() ?
				$subject :
				// If not provided, expectation will inspect the default subject.
				$this->check->configuration->subject
		);
	}

	/**
	 * Check whether a method is a check case by its name.
	 *
	 * @param \ReflectionMethod|string $method
	 *
	 * @return bool
	 */
	public static function is_check_case( $method ) {
		return ! empty(
			preg_grep(
				'/^' . static::CHECK_CASE_PREFIX . '.+/',
				[ is_string( $method ) ? $method : $method->name ]
			)
		);
	}

	/**
	 * Set the method the check-case represents.
	 *
	 * @param \ReflectionMethod|string $method
	 *
	 * @return void
	 * @throws \Exception
	 * @throws Check_Case_Exception
	 */
	protected function set_method( $method ) {
		$method_name = $method instanceof \ReflectionMethod ?
			$method->name :
			$method;

		if ( ! static::is_check_case( $method_name ) ) {
			throw new Check_Case_Exception(
				sprintf(
					'The check-case `%s` should be prefixed with `%s`.',
					$method_name,
					static::CHECK_CASE_PREFIX
				)
			);
		}

		try {
			// Whether `method` is a string or a `ReflectionMethod`, it's still important to validate the method
			// existence in the given check class.
			$method = ( new \ReflectionClass( $this->check ) )
				->getMethod( $method_name );
		} catch ( \ReflectionException $e ) {
			throw new Check_Case_Exception(
				sprintf(
					'The check-case `%s` is not exists in check `%s`.',
					$method_name,
					$this->check->get_check_class()
				)
			);
		}

		$this->method = $method;
	}
}

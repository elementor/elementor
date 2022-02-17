<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Testing\Exceptions\Expectation_Exception;
use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

class Expectation implements Diagnosable {

	/**
	 * A subject to check the expectation against.
	 *
	 * @var \Closure
	 */
	public $subject = null;

	/**
	 * A description about the expectation purpose and what's inspecting.
	 *
	 * @var string
	 */
	public $description;

	/**
	 * An exception from last failure of the inspection (if failed).
	 *
	 * @var \Exception
	 */
	protected $exception;

	/**
	 * The Expectation constructor.
	 *
	 * @param mixed $subject
	 * @throws \InvalidArgumentException
	 */
	public function __construct( $subject = null ) {
		// Sometimes the expectation can assert subject to be null, and therefore argument presence validation
		// should relay on `func_num_args` and not if its equal to null.
		if ( ! func_num_args() ) {
			throw new \InvalidArgumentException( 'Expectation has to be introduced with a subject to be inspected.' );
		}

		$this->subject = $subject;
	}

	/**
	 * @inheritDoc
	 */
	public function get_name() {
		return $this->description ?: __( '(no description)' );
	}

	/**
	 * @inheritDoc
	 */
	public function get_diagnosables() {
		return [];
	}

	/**
	 * Set the closure that inspects the expectation constraints.
	 *
	 * @param \Closure $closure
	 *
	 * @return static
	 * @throws \Exception
	 */
	public function to_meet( $closure ) {
		$this->inspect(
			$closure,
			'Failed to assert that the subject meets with the given callback.'
		);

		return $this;
	}

	/**
	 * Set the expectation description.
	 *
	 * @return static
	 */
	public function describe( $text ) {
		$this->description = $text;

		return $this;
	}

	/**
	 * @inheritDoc
	 */
	public function error() {
		return $this->exception;
	}

	/**
	 * Inspect the expectation by the given closure, and in case of failure - throw an exception with the given message.
	 *
	 * @param $closure
	 * @param $exception_message
	 *
	 * @return void
	 * @throws Expectation_Exception
	 */
	protected function inspect( $closure, $exception_message ) {
		$this->exception = ! $closure->__invoke( $this->subject ) ?
			new Expectation_Exception( $this->description ?: $exception_message ) :
			null;

		if ( $this->exception ) {
			throw $this->exception;
		}
	}
}

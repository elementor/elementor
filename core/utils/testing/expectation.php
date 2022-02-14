<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Testing\Exceptions\Expectation_Exception;

class Expectation {
	/**
	 * A subject to check the expectations against.
	 *
	 * @var \Closure
	 */
	public $subject = null;

	/**
	 * A result for the expectation from the last inspection.
	 *
	 * @var boolean
	 */
	public $result;

	/**
	 * A description about the expectation purpose and what's inspecting.
	 *
	 * @var string
	 */
	public $description;

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
	 * Set the closure that inspects the expectation constraints.
	 *
	 * @param \Closure $closure
	 *
	 * @return static
	 * @throws \Exception
	 */
	public function to_meet( $closure ) {
		$this->result = $closure->__invoke( $this->subject );

		if ( ! $this->result ) {
			throw new Expectation_Exception( 'Failed to assert that the subject meets with the given callback.' );
		}

		return $this;
	}

	/**
	 * Get the expectation description.
	 *
	 * @return static
	 */
	public function description( $text ) {
		$this->description = $text;

		return $this;
	}
}

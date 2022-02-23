<?php

namespace Elementor\Core\Utils\Checking;

abstract class Diagnosable {

	/**
	 * An exception that's kept when the diagnosable fails.
	 *
	 * @var \Exception
	 */
	protected $exception;

	/**
	 * Create a diagnostics instance for the diagnosable.
	 *
	 * @return Diagnostics
	 */
	public function diagnose() {
		return new Diagnostics( $this );
	}

	/**
	 * If there was an error from the last inspection of the diagnosable, retrieve it.
	 *
	 * @return \Exception
	 */
	public function error() {
		return $this->exception;
	}

	/**
	 * Get the diagnosable object name.
	 *
	 * @return string
	 */
	abstract public function get_name();

	/**
	 * Get a list of children diagnosables. This happens when the current one inspects others.
	 *
	 * @return Diagnosable[]
	 */
	abstract public function get_diagnosables();
}

<?php

namespace Elementor\Core\Utils\Testing\Interfaces;

interface Diagnosable {

	/**
	 * Get the diagnosable object name.
	 *
	 * @return string
	 */
	public function get_name();

	/**
	 * Get a list of children diagnosables. This happens when the current one inspects others.
	 *
	 * @return Diagnosable[]
	 */
	public function get_diagnosables();

	/**
	 * If there was an error from the last inspection of the diagnosable, retrieve it.
	 *
	 * @return \Exception
	 */
	public function error();
}

<?php

namespace Elementor\Core\Utils\Testing;

use \Elementor\Core\Utils\Testing\Interfaces\Diagnosable as DiagnosableInterface;

abstract class Diagnosable implements DiagnosableInterface {
	/**
	 * Create a diagnostics instance for the diagnosable.
	 *
	 * @return Diagnostics
	 */
	public function diagnose() {
		return new Diagnostics( $this );
	}
}

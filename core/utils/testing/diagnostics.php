<?php

namespace Elementor\Core\Utils\Testing;

class Diagnostics implements \JsonSerializable {

	/**
	 * The Diagnostics constructor.
	 *
	 * @param Test[] $tests
	 */
	public function __construct( $tests ) {
		$this->tests = $tests;
	}

	public function jsonSerialize() {
		$serialized = [];

		foreach( $this->tests as $test ) {
		}
	}
}

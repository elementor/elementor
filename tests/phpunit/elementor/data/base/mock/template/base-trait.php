<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

/**
 * BaseTrait.
 * Simple trait for reduce code size.
 */
trait BaseTrait {

	private $random = null;

	public function get_name() {
		static $name = null;

		if ( ! $name ) {
			$this->random = rand_long_str( 5 );
			$name = 'test-' . $this->get_type() . '-' . $this->random;
		}

		return $name;
	}

	abstract function get_type();

	public function get_random() {
		return $this->random;
	}
}

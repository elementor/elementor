<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

/**
 * BaseTrait.
 * Simple trait for reduce code size.
 */
trait BaseTrait {

	public $random = null;
	public $bypass_register_status = false;

	public function get_name() {
		if ( ! $this->random ) {
			$this->random = rand_long_str( 5 );
		}

		return 'test-' . $this->get_type() . '-' . $this->random;
	}

	abstract function get_type();

	public function bypass_original_register( $status = true ) {
		$this->bypass_register_status = $status;
	}
}

<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

/**
 * BaseTrait.
 * Simple trait for reduce code size.
 */
trait BaseTrait {

	public $test_data = [];
	public $random = null;
	public $bypass_register_status = false;
	public $bypass_permission_status = false;

	public function get_name() {
		if ( ! $this->random ) {
			$this->random = rand_long_str( 5 );
		}

		return 'test-' . $this->get_type() . '-' . $this->random;
	}

	abstract function get_type();


	public function bypass_original_permission( $status = true ) {
		$this->bypass_permission_status = $status;
	}

	public function bypass_original_register( $status = true ) {
		$this->bypass_register_status = $status;
	}

	public function set_test_data( $key, $value ) {
		$this->test_data[ $key ] = $value;
	}

	public function get_test_data( $key ) {
		if ( $key ) {
			if ( isset( $this->test_data[ $key ] ) ) {
				return $this->test_data[ $key ];
			}

			return false;
		}

		return $this->test_data;
	}
}

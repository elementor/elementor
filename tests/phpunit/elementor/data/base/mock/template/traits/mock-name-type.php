<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits;

trait Mock_Name_Type {
	public $random = null;

	public function get_name() {
		if ( ! $this->random ) {
			$this->random = rand_long_str( 5 );
		}

		return 'test-' . $this->get_type() . '-' . $this->random;
	}

	abstract function get_type();
}

<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits;

trait Mock_Bypass_Register {
	public $bypass_register_status = false;

	public function bypass_original_register( $status = true ) {
		$this->bypass_register_status = $status;
	}

	protected function register() {
		if ( isset( $this->controller ) ) {
			if ( ! $this->controller->bypass_register_status ) {
				return parent::register();
			}
		} else if ( ! $this->bypass_register_status ) {
			parent::register();
		}
	}

	public function do_register() {
		parent::register();
	}
}

<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits;

trait MockBypassPermission {
	public $bypass_permission_status = false;

	public function bypass_original_permission( $status = true ) {
		$this->bypass_permission_status = $status;
	}

	public function get_permission_callback( $request ) {
		if ( $this->bypass_permission_status ) {
			return true;
		}

		return parent::get_permission_callback( $request );
	}
}

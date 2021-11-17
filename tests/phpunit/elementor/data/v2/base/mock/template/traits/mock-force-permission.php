<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Mock\Template\Traits;

trait Mock_Force_Permission {
	public $bypass_permission_value = true;
	public $is_permission_forced = false;

	/**
	 * @var callable
	 */
	public $custom_permission_callback = null;

	public function bypass_original_permission( $status = true ) {
		$this->is_permission_forced = $status;
	}

	public function bypass_set_value( $value ) {
		$this->bypass_permission_value = $value;
	}

	public function get_permission_callback( $request ) {
		if ( $this->is_permission_forced ) {
			return $this->bypass_permission_value;
		}

		if ( $this->custom_permission_callback ) {
			$callback = $this->custom_permission_callback;

			return $callback( $request );
		}

		return parent::get_permission_callback( $request );
	}

	public function set_custom_permission_callback( $callback ) {
		$this->custom_permission_callback = $callback;
	}
}

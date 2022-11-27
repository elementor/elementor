<?php
namespace Elementor\App\Services;

abstract class Base_Service {

	/**
	 * Retrieve the service name.
	 * @return string
	 */
	abstract public function get_name() : string;

	/**
	 * Register the service.
	 * @return mixed
	 */
	abstract public function register();
}

<?php
namespace Elementor\App\Services\License;

use Elementor\App\Services\Base_Service;

class License_Service extends Base_Service {

	public function register() {
		return $this;
	}

	public function is_valid() {
		return false;
	}
}

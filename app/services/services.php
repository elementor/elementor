<?php

namespace Elementor\App\Services;

use Elementor\App\Services\License\License_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Services {
	private $services = [];

	public function __construct() {
		add_action( 'elementor/common/after_register_scripts', function () {
			$this->register_services();
		} );
	}

	/**
	 * Get a registered service
	 *
	 * @param $name
	 * @return mixed|null
	 */
	public function get_service( $name ) {
		if ( ! empty( $this->services[ $name ] ) ) {
			return $this->services[ $name ];
		}

		return null;
	}

	private function register_services() {
		$this->register_service( new License_Service() );

		$this->services = apply_filters( 'elementor/app/services/register', $this->services );
	}

	private function register_service( $service ) {
		$this->services[ $service->get_name() ] = $service->register();
	}
}

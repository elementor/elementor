<?php

namespace Elementor\App\Services;

use Elementor\App\Services\Account\Account_Service;
use Elementor\App\Services\License\License_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Services {
	/**
	 * @var Account_Service
	 */
	public $account;

	/**
	 * @var License_Service
	 */
	public $license;

	public function __construct() {
		add_action( 'elementor/common/after_register_scripts', function () {
			$this->register_services();
		} );
	}

	private function register_services() {
		$this->account = ( new Account_Service() )->register();
		$this->license = ( new License_Service() )->register();

		do_action( 'elementor/app/services/register', $this );
	}
}

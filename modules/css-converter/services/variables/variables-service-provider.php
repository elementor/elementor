<?php

namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Service_Provider {

	private static $instance = null;
	private $registration_service = null;
	private $conversion_service = null;
	private $integration_service = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function is_available(): bool {
		return class_exists( '\Elementor\Modules\Variables\Module' );
	}

	public function get_registration_service( $update_mode = Variables_Registration_Service::DEFAULT_UPDATE_MODE ): Variables_Registration_Service {
		if ( null === $this->registration_service || $this->registration_service->get_update_mode() !== $update_mode ) {
			$this->registration_service = new Variables_Registration_Service( $update_mode );
		}
		return $this->registration_service;
	}

	public function get_conversion_service(): Variable_Conversion_Service {
		if ( null === $this->conversion_service ) {
			$this->conversion_service = new Variable_Conversion_Service();
		}
		return $this->conversion_service;
	}

	public function get_integration_service( $update_mode = Variables_Registration_Service::DEFAULT_UPDATE_MODE ): Variables_Integration_Service {
		if ( null === $this->integration_service || $this->integration_service->get_update_mode() !== $update_mode ) {
			$this->integration_service = new Variables_Integration_Service( $update_mode );
		}
		return $this->integration_service;
	}

	private function __construct() {
		// Private constructor for singleton
	}
}

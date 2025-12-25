<?php

namespace Elementor\Modules\AtomicConverters;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicConverters\Converter_Registry;
use Elementor\Modules\AtomicConverters\Converters\Color_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	private Converter_Registry $registry;
	private Rest_Api $rest_api;

	public function get_name() {
		return 'atomic-converters';
	}

	public function __construct() {
		parent::__construct();

		$this->registry = new Converter_Registry();
		$this->register_converters();

		$this->rest_api = new Rest_Api( $this->registry );
		$this->rest_api->register_hooks();
	}

	private function register_converters(): void {
		$this->registry->register( new Color_Converter() );
	}

	public function get_registry(): Converter_Registry {
		return $this->registry;
	}
}

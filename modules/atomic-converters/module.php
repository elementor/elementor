<?php

namespace Elementor\Modules\AtomicConverters;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\AtomicConverters\Css\Converter_Registry;
use Elementor\Modules\AtomicConverters\Css\Converters\Color_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {
	private Converter_Registry $registry;

	public function get_name() {
		return 'atomic-converters';
	}

	public function __construct() {
		parent::__construct();

		$this->registry = new Converter_Registry();
		$this->register_converters();

		add_action( 'rest_api_init', function() {
			( new Rest_Api( $this->registry ) )->register_routes();
		} );
	}

	private function register_converters(): void {
		$this->registry->register( new Color_Converter() );
	}

	public function get_registry(): Converter_Registry {
		return $this->registry;
	}
}

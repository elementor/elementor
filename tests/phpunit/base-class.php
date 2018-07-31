<?php

namespace Elementor\Testing;

class Elementor_Test_Base extends \WP_UnitTestCase {
	/**
	 * @var Local_Factory
	 */
	private static $local_factory;

	public function __get( $name ) {
		if ( 'local_factory' === $name ) {
			return self::local_factory();
		}

		return parent::__get( $name );
	}

	protected static function local_factory() {
		if ( ! self::$local_factory ) {
			self::$local_factory = Manager::$instance->get_local_factory();
		}

		return self::$local_factory;
	}

	/*public function __construct( $name = null, array $data = [], $data_name = '' ) {
		parent::__construct( $name, $data, $data_name );
	}*/
}

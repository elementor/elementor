<?php

namespace Elementor\Core\Logger;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Logger\Items\PHP;
use Elementor\Core\Logger\Loggers\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	protected $loggers = [];
	protected $instances = [];
	protected $default_logger = 'options';

	public function __construct() {
		$this->register_logger( 'options', 'Elementor\Core\Logger\Loggers\Options' );

		$this->set_default_logger( 'options' );

		register_shutdown_function( [ $this, 'shutdown' ] );

		do_action( 'elementor/log/init' );
	}

	public function get_name() {
		return 'log';
	}

	public function shutdown() {
		$last_error = error_get_last();

		if ( ! $last_error ) {
			return;
		}

		if ( false !== strpos( $last_error['file'], 'elementor' ) ) {
			$last_error['type'] = $this->get_log_level_from_php_error( $last_error['type'] );

			$item = new PHP( $last_error );

			$this->get_logger()->log( $item );
		}
	}

	public function register_logger( $name, $class ) {
		$this->loggers[ $name ] = $class;
	}

	public function set_default_logger( $name ) {
		if ( ! empty( $this->loggers[ $name ] ) ) {
			$this->default_logger = $name;
		}
	}

	/**
	 * @param string $name
	 *
	 * @return Base
	 */
	public function get_logger( $name = '' ) {
		if ( empty( $name ) || ! isset( $this->loggers[ $name ] ) ) {
			$name = $this->default_logger;
		}

		if ( empty( $this->instances[ $name ] ) ) {
			$this->instances[ $name ] = new $this->loggers[ $name ]();
		}

		return $this->instances[ $name ];
	}

	private function get_log_level_from_php_error( $type ) {
		$map = [
			E_CORE_ERROR => Base::LEVEL_ERROR,
			E_ERROR => Base::LEVEL_ERROR,
			E_USER_ERROR => Base::LEVEL_ERROR,
			E_COMPILE_ERROR => Base::LEVEL_ERROR,
			E_RECOVERABLE_ERROR => Base::LEVEL_ERROR,
			E_PARSE => Base::LEVEL_ERROR,
			E_STRICT => Base::LEVEL_ERROR,

			E_WARNING => Base::LEVEL_WARNING,
			E_USER_WARNING => Base::LEVEL_WARNING,
			E_CORE_WARNING => Base::LEVEL_WARNING,
			E_COMPILE_WARNING => Base::LEVEL_WARNING,

			E_NOTICE => Base::LEVEL_NOTICE,
			E_USER_NOTICE => Base::LEVEL_NOTICE,
			E_DEPRECATED => Base::LEVEL_NOTICE,
			E_USER_DEPRECATED => Base::LEVEL_NOTICE,
		];

		return isset( $map[ $type ] ) ? $map[ $type ] : Base::LEVEL_ERROR;
	}
}

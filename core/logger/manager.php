<?php

namespace Elementor\Core\Logger;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Logger\Items\PHP;
use Elementor\Core\Logger\Items\JS;
use Elementor\Core\Logger\Items\File;
use Elementor\Core\Logger\Items\Base as Log_Item;
use Elementor\Core\Logger\Loggers\Logger_Interface;
use Elementor\System_Info\Main;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	protected $loggers = [];
	protected $instances = [];
	protected $default_logger = 'options';

	const REPORT_NAME = 'new_log';

	public function __construct() {

		$this->register_logger( 'options', 'Elementor\Core\Logger\Loggers\Options' );
		$this->register_logger( 'uploads', 'Elementor\Core\Logger\Loggers\Uploads' );

		$this->set_default_logger( 'options' );

		add_action( 'wp_ajax_elementor_debug_log', [ $this, 'debug_log' ] );
		register_shutdown_function( [ $this, 'shutdown' ] );

		$this->add_system_info_report();

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
	 * Debug log.
	 *
	 * Log Elementor errors and save them in the database.
	 *
	 * Fired by `wp_ajax_elementor_debug_log` action.
	 *
	 */
	public function debug_log() {
		if ( empty( $_POST['data'] ) ) {
			return;
		}

		foreach ( $_POST['data'] as $error ) {
			if ( false !== strpos( $error['url'], 'elementor' ) ) {
				$error['type'] = $this->get_log_level_from_php_error( $error['type'] );
				$item = new JS( $error );
				$this->get_logger()->log( $item );
			}
		}
	}

	/**
	 * @param string $name
	 *
	 * @return Logger_Interface
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

	public function log( $message, $level = E_NOTICE, $meta = [] ) {

		$log_item = new Log_Item( [
			'message' => $message,
			'type' => $level,
			'meta' => $meta,
		] );
		$this->get_logger()->log( $log_item );
	}

	public function trace_log( $message, $level = E_ERROR, $meta = [] ) {
		$stack = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 3 );
		array_shift( $stack ); //remove current function call
		if ( empty( $stack ) ) {
			return;
		}
		$line = $stack[0]['line'];
		$file = $stack[0]['file'];
		$meta['elementor_debug_backtrace'] = $stack;
		$error = new File( [
			'message' => $message,
			'type' => $level,
			'meta' => $meta,
			'file' => $file,
			'line' => $line,
		] );

		$this->get_logger()->log( $error );
	}

	private function get_log_level_from_php_error( $type ) {
		$error_map = [
			E_CORE_ERROR => Logger_Interface::LEVEL_ERROR,
			E_ERROR => Logger_Interface::LEVEL_ERROR,
			E_USER_ERROR => Logger_Interface::LEVEL_ERROR,
			E_COMPILE_ERROR => Logger_Interface::LEVEL_ERROR,
			E_RECOVERABLE_ERROR => Logger_Interface::LEVEL_ERROR,
			E_PARSE => Logger_Interface::LEVEL_ERROR,
			E_STRICT => Logger_Interface::LEVEL_ERROR,

			E_WARNING => Logger_Interface::LEVEL_WARNING,
			E_USER_WARNING => Logger_Interface::LEVEL_WARNING,
			E_CORE_WARNING => Logger_Interface::LEVEL_WARNING,
			E_COMPILE_WARNING => Logger_Interface::LEVEL_WARNING,

			E_NOTICE => Logger_Interface::LEVEL_NOTICE,
			E_USER_NOTICE => Logger_Interface::LEVEL_NOTICE,
			E_DEPRECATED => Logger_Interface::LEVEL_NOTICE,
			E_USER_DEPRECATED => Logger_Interface::LEVEL_NOTICE,
		];

		return isset( $error_map[ $type ] ) ? $error_map[ $type ] : Logger_Interface::LEVEL_ERROR;
	}

	private function add_system_info_report() {
		Main::add_report(
			self::REPORT_NAME, [
				'file_name' => __DIR__ . '/log-reporter.php',
				'class_name' => __NAMESPACE__ . '\Log_Reporter',
			]
		);
	}
}

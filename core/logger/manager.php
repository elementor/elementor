<?php
namespace Elementor\Core\Logger;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module;
use Elementor\Core\Logger\Loggers\Logger_Interface;
use Elementor\Core\Logger\Items\PHP;
use Elementor\Core\Logger\Items\JS;
use Elementor\Plugin;
use Elementor\System_Info\Main as System_Info;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	protected $loggers = [];

	protected $default_logger = '';

	public function get_name() {
		return 'log';
	}

	public function shutdown() {
		$last_error = error_get_last();

		if ( ! $last_error ) {
			return;
		}

		if ( empty( $last_error['file'] ) ) {
			return;
		}

		$error_path = ( wp_normalize_path( $last_error['file'] ) );
		// `untrailingslashit` in order to include other plugins prefixed with elementor.
		$elementor_path = untrailingslashit( wp_normalize_path( ELEMENTOR_PATH ) );

		if ( false === strpos( $error_path, $elementor_path ) ) {
			return;
		}

		$last_error['type'] = $this->get_log_type_from_php_error( $last_error['type'] );
		$last_error['trace'] = true;

		$item = new PHP( $last_error );

		$this->get_logger()->log( $item );
	}

	public function add_system_info_report() {
		System_Info::add_report(
			'log', [
				'file_name' => __DIR__ . '/log-reporter.php',
				'class_name' => __NAMESPACE__ . '\Log_Reporter',
			]
		);
	}

	/**
	 * Javascript log.
	 *
	 * Log Elementor errors and save them in the database.
	 *
	 * Fired by `wp_ajax_elementor_js_log` action.
	 *
	 */
	public function js_log() {
		/** @var Module $ajax */
		$ajax = Plugin::$instance->common->get_component( 'ajax' );

		if ( ! $ajax->verify_request_nonce() || empty( $_POST['data'] ) ) {
			wp_send_json_error();
		}

		foreach ( $_POST['data'] as $error ) {
			$error['type'] = Logger_Interface::LEVEL_ERROR;

			if ( ! empty( $error['customFields'] ) ) {
				$error['meta'] = $error['customFields'];
			}

			$item = new JS( $error );
			$this->get_logger()->log( $item );
		}

		wp_send_json_success();
	}

	public function register_logger( $name, $class ) {
		$this->loggers[ $name ] = $class;
	}

	public function set_default_logger( $name ) {
		if ( ! empty( $this->loggers[ $name ] ) ) {
			$this->default_logger = $name;
		}
	}

	public function register_default_loggers() {
		$this->register_logger( 'db', 'Elementor\Core\Logger\Loggers\Db' );
		$this->set_default_logger( 'db' );
	}

	/**
	 * @param string $name
	 *
	 * @return Logger_Interface
	 */
	public function get_logger( $name = '' ) {
		$this->register_loggers();

		if ( empty( $name ) || ! isset( $this->loggers[ $name ] ) ) {
			$name = $this->default_logger;
		}

		if ( ! $this->get_component( $name ) ) {
			$this->add_component( $name, new $this->loggers[ $name ]() );
		}

		return $this->get_component( $name );
	}

	/**
	 * @param string $message
	 * @param array  $args
	 *
	 * @return void
	 */
	public function log( $message, $args = [] ) {
		$this->get_logger()->log( $message, $args );
	}

	/**
	 * @param string $message
	 * @param array $args
	 *
	 * @return void
	 */
	public function info( $message, $args = [] ) {
		$this->get_logger()->info( $message, $args );
	}

	/**
	 * @param string $message
	 * @param array $args
	 *
	 * @return void
	 */
	public function notice( $message, $args = [] ) {
		$this->get_logger()->notice( $message, $args );
	}

	/**
	 * @param string $message
	 * @param array $args
	 *
	 * @return void
	 */
	public function warning( $message, $args = [] ) {
		$this->get_logger()->warning( $message, $args );
	}

	/**
	 * @param string $message
	 * @param array $args
	 *
	 * @return void
	 */
	public function error( $message, $args = [] ) {
		$this->get_logger()->error( $message, $args );
	}

	private function get_log_type_from_php_error( $type ) {
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

	private function register_loggers() {
		if ( ! did_action( 'elementor/loggers/register' ) ) {
			do_action( 'elementor/loggers/register', $this );
		}
	}

	public function __construct() {
		register_shutdown_function( [ $this, 'shutdown' ] );

		add_action( 'admin_init', [ $this, 'add_system_info_report' ] );

		add_action( 'wp_ajax_elementor_js_log', [ $this, 'js_log' ] );

		add_action( 'elementor/loggers/register', [ $this, 'register_default_loggers' ] );
	}
}

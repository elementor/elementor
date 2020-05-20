<?php
namespace Elementor\Data;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Data\Base\Controller;
use Elementor\Data\Base\Processor;
use Elementor\Data\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends BaseModule {

	/**
	 * Loaded controllers.
	 *
	 * @var \Elementor\Data\Base\Controller[]
	 */
	public $controllers = [];

	public function get_name() {
		return 'data-manager';
	}

	/**
	 * @return \Elementor\Data\Base\Controller[]
	 */
	public function get_controllers() {
		return $this->controllers;
	}

	/**
	 * Register controller.
	 *
	 * @param string $controller_class_name
	 */
	private function register_controller( $controller_class_name ) {
		$controller_instance = new $controller_class_name();

		$this->register_controller_instance( $controller_instance );
	}

	/**
	 * Register controller instance.
	 *
	 * @param \Elementor\Data\Base\Controller $controller_instance
	 *
	 * @return \Elementor\Data\Base\Controller
	 */
	public function register_controller_instance( $controller_instance ) {
		// TODO: Validate instance.

		$this->controllers[ $controller_instance->get_name() ] = $controller_instance;

		return $controller_instance;
	}

	/**
	 * Find controller instance.
	 *
	 * By given command name.
	 *
	 * @param string $command
	 *
	 * @return false|\Elementor\Data\Base\Controller
	 */
	public function find_controller_instance( $command ) {
		$command_parts = explode( '/', $command );
		$assumed_command_parts = [];

		foreach ( $command_parts as $command_part ) {
			$assumed_command_parts [] = $command_part;

			foreach ( $this->controllers as $controller_name => $controller ) {
				$assumed_command = implode( '/', $assumed_command_parts );

				if ( $assumed_command === $controller_name ) {
					return $controller;
				}
			}
		}

		return false;
	}

	/**
	 * Command to endpoint.
	 *
	 * Format is required otherwise $command will returned.
	 *
	 * @param string $command
	 * @param string $format
	 * @param array   $args
	 *
	 * @return string endpoint
	 */
	public function command_to_endpoint( $command, $format, $args ) {
		$endpoint = $command;

		if ( $format ) {
			$formatted = $format;

			array_walk( $args, function ( $val, $key ) use ( &$formatted ) {
				$formatted = str_replace( ':' . $key, $val, $formatted );
			} );

			// Remove if not requested.
			if ( strstr( $formatted, '/:' ) ) {
				$formatted = substr( $formatted, 0, strpos( $formatted, '/:' ) );
			}

			$endpoint = $formatted;
		}

		return $endpoint;
	}

	/**
	 * Run server.
	 *
	 * Init WordPress reset api.
	 *
	 * @return \WP_REST_Server
	 */
	public function run_server() {
		static $server = null;

		if ( ! $server ) {
			$server = rest_get_server(); // Init API.
		}

		return $server;
	}

	/**
	 * Run internal.
	 *
	 * @param string $endpoint
	 * @param array  $args
	 * @param string $method
	 *
	 * @return \WP_REST_Response
	 */
	public function run_internal( $endpoint, $args, $method ) {
		$this->run_server();

		$endpoint = '/' . Controller::ROOT_NAMESPACE . '/v' . Controller::VERSION . '/' . $endpoint;

		// Run reset api.
		$request = new \WP_REST_Request( $method, $endpoint );
		$request->set_query_params( $args );

		return rest_do_request( $request );
	}

	/**
	 * Run processor.
	 *
	 * @param \Elementor\Data\Base\Processor $processor
	 * @param array                          $data
	 *
	 * @return mixed
	 */
	public static function run_processor( $processor, $data ) {
		if ( call_user_func_array( [ $processor, 'get_conditions' ], $data ) ) {
			return call_user_func_array( [ $processor, 'apply' ], $data );
		}

		return null;
	}

	/**
	 * Run processors.
	 *
	 * Filter them by class.
	 *
	 * @param \Elementor\Data\Base\Processor[] $processors
	 * @param string                           $filter_by_class
	 * @param array                            $data
	 *
	 * @return false|array
	 */
	public static function run_processors( $processors, $filter_by_class, $data ) {
		foreach ( $processors as $processor ) {
			if ( $processor instanceof $filter_by_class ) {
				if ( Processor\Before::class === $filter_by_class ) {
					self::run_processor( $processor, $data );
				} elseif ( Processor\After::class === $filter_by_class ) {
					$result = self::run_processor( $processor, $data );
					if ( $result ) {
						$data[1] = $result;
					}
				} else {
					// TODO: error
					break;
				}
			}
		}

		return isset( $data[1] ) ? $data[1] : false;
	}

	/**
	 * Run endpoint.
	 *
	 * @param string $endpoint
	 * @param array $args
	 * @param string $method
	 *
	 * @return array
	 */
	public static function run_endpoint( $endpoint, $args = [], $method = 'GET' ) {
		/** @var \Elementor\Data\Manager $manager */
		$manager = self::instance();

		$response = $manager->run_internal( $endpoint, $args, $method );

		return $response->get_data();
	}

	/**
	 * Run ( simulated reset api ).
	 *
	 * Do:
	 * Init reset server.
	 * Run before processors.
	 * Run command as reset api endpoint from internal.
	 * Run after processors.
	 *
	 * @param string $command
	 * @param array  $args
	 * @param string $method
	 *
	 * @return array processed result
	 */
	public static function run( $command, $args = [], $method = 'GET' ) {
		/** @var \Elementor\Data\Manager $manager */
		$manager = self::instance();
		$manager->run_server();

		$controller_instance = $manager->find_controller_instance( $command );

		if ( ! $controller_instance ) {
			return [];
		}

		$format = isset( $controller_instance->command_formats[ $command ] ) ?
			$controller_instance->command_formats[ $command ] : false;

		$command_processors = $controller_instance->get_processors( $command );
		$endpoint = $manager->command_to_endpoint( $command, $format, $args );

		self::run_processors( $command_processors, Processor\Before::class, [ $args ] );

		$response = $manager->run_internal( $endpoint, $args, $method );
		$result = $response->get_data();

		if ( $response->is_error() ) {
			return [];
		}

		$result = self::run_processors( $command_processors, Processor\After::class, [ $args, $result ] );

		return $result;
	}
}

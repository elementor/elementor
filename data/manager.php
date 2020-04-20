<?php

namespace Elementor\Data;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Data\Base\Controller;
use Elementor\Data\Base\Processor;
use Elementor\Data\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * TODO: Manager should know if its `editor/admin/frontend` and register the right commands.
 */
class Manager extends BaseModule {

	/**
	 * Loaded controllers.
	 *
	 * @var array
	 */
	public $controllers = [];

	/**
	 * Manager constructor.
	 */
	public function __construct() {
		$this->register_editor_controllers();
	}

	public function get_name() {
		return 'data-manager';
	}

	/**
	 * Register editor controllers.
	 */
	public function register_editor_controllers() {
		$this->register_controller( Editor\Document\Controller::class );
		$this->register_controller( Editor\Globals\Controller::class );
	}

	/**
	 * Register controller.
	 *
	 * @param string $controller_class_name
	 */
	private function register_controller( $controller_class_name ) {
		$controller_instance = new $controller_class_name();

		$this->controllers[ $controller_instance->get_name() ] = $controller_instance;
	}

	/**
	 * Find controller instance.
	 *
	 * By given controller name.
	 *
	 * @param string $controller_name
	 *
	 * @return false|\Elementor\Data\Base\Controller
	 */
	public function find_controller_instance( $controller_name ) {
		$result = false;

		if ( isset( $this->controllers[ $controller_name ] ) ) {
			$result = $this->controllers[ $controller_name ];
		}

		return $result;
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
	 * Run ( simulated reset api ).
	 *
	 * Init reset server, run command as reset api endpoint from internal, run processors.
	 *
	 * @param string $command
	 * @param array  $args
	 * @param string $method
	 *
	 * @return array processed result
	 */
	public static function run( $command, $args = [], $method = 'GET' ) {
		static $server = null;

		if ( ! $server ) {
			$server = rest_get_server(); // Init API.
		}

		/** @var \Elementor\Data\Manager $manager */
		$manager = self::instance();

		$command_processors = [];
		$command_parts = explode( '/', $command );
		$controller = $command_parts[0];
		$controller_instance = $manager->find_controller_instance( $controller );

		if ( $controller_instance ) {
			$command_processors = $controller_instance->get_processors( $command );
		}

		self::run_processors( $command_processors, Processor\Before::class, [ $args ] );

		// Run reset api.
		$request = new \WP_REST_Request( $method, '/' . Controller::ROOT_NAMESPACE . '/v' . Controller::VERSION . '/' . $command );
		$request->set_query_params( $args );
		$response = rest_do_request( $request );
		$result = $server->response_to_data( $response, false );

		$result = self::run_processors( $command_processors, Processor\After::class, [ $args, $result ] );

		return $result;
	}
}


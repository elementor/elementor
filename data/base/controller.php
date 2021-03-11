<?php
namespace Elementor\Data\Base;

use Elementor\Data\Manager;
use WP_REST_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Controller extends WP_REST_Controller {
	/**
	 * Loaded endpoint(s).
	 *
	 * @var \Elementor\Data\Base\Endpoint[]
	 */
	public $endpoints = [];

	/**
	 * Index endpoint.
	 *
	 * @var \Elementor\Data\Base\Endpoint\Index
	 */
	public $index_endpoint = null;

	/**
	 * Loaded processor(s).
	 *
	 * @var \Elementor\Data\Base\Processor[][]
	 */
	public $processors = [];

	/**
	 * Controller constructor.
	 *
	 * Register endpoints on 'rest_api_init'.
	 *
	 */
	public function __construct() {
		$this->namespace = Manager::ROOT_NAMESPACE . '/v' . Manager::VERSION;
		$this->rest_base = Manager::REST_BASE . $this->get_name();

		add_action( 'rest_api_init', function () {
			$this->register(); // Because 'register' is protected.
		} );

		/**
		 * Since all actions were removed for custom internal REST server.
		 * Re-add the actions.
		 */
		add_action( 'elementor_rest_api_before_init', function () {
			add_action( 'rest_api_init', function() {
				$this->register();
			} );
		} );
	}

	/**
	 * Get controller name.
	 *
	 * @return string
	 */
	abstract public function get_name();

	/**
	 * Register endpoints.
	 */
	abstract public function register_endpoints();

	/**
	 * Get full controller name.
	 *
	 * The 'main' job of this method, is to be extend, for example sub-controller will return it's parent name,
	 * including his self.
	 *
	 * @return string
	 */
	public function get_full_name() {
		return $this->get_name();
	}

	/**
	 * Get controller namespace.
	 *
	 * @return string
	 */
	public function get_namespace() {
		return $this->namespace;
	}

	/**
	 * Get controller reset base.
	 *
	 * @return string
	 */
	public function get_base_route() {
		return $this->rest_base;
	}

	/**
	 * Get controller route.
	 *
	 * @return string
	 */
	public function get_controller_route() {
		return $this->get_namespace() . '/' . $this->get_base_route();
	}

	/**
	 * Retrieves rest route(s) index for current controller.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_controller_index() {
		$server = rest_get_server();
		$routes = $server->get_routes();

		$endpoints = array_intersect_key( $server->get_routes(), $routes );

		$controller_route = $this->get_controller_route();

		array_walk( $endpoints, function ( &$item, $endpoint ) use ( &$endpoints, $controller_route ) {
			if ( ! strstr( $endpoint, $controller_route ) ) {
				unset( $endpoints[ $endpoint ] );
			}
		} );

		$data = [
			'namespace' => $this->get_namespace(),
			'controller' => $controller_route,
			'routes' => $server->get_data_for_routes( $endpoints ),
		];

		$response = rest_ensure_response( $data );

		// Link to the root index.
		$response->add_link( 'up', rest_url( '/' ) );

		return $response;
	}

	/**
	 * Get permission callback.
	 *
	 * Default controller permission callback.
	 * By default endpoint will inherit the permission callback from the controller.
	 * By default permission is `current_user_can( 'administrator' );`.
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return bool
	 */
	public function get_permission_callback( $request ) {
		// The function is public since endpoint need to access it.
		switch ( $request->get_method() ) {
			case 'GET':
			case 'POST':
			case 'UPDATE':
			case 'PUT':
			case 'DELETE':
			case 'PATCH':
				return current_user_can( 'administrator' );
		}

		return false;
	}

	public function get_items( $request ) {
		return $this->get_controller_index();
	}

	/**
	 * Creates multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function create_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), [ 'status' => 405 ] );
	}

	/**
	 * Updates multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function update_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), [ 'status' => 405 ] );
	}

	/**
	 * Delete multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function delete_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), [ 'status' => 405 ] );
	}

	/**
	 * Get processors.
	 *
	 * @param string $command
	 *
	 * @return \Elementor\Data\Base\Processor[]
	 */
	public function get_processors( $command ) {
		$result = [];

		if ( isset( $this->processors[ $command ] ) ) {
			$result = $this->processors[ $command ];
		}

		return $result;
	}

	/**
	 * Register processors.
	 */
	public function register_processors() {
	}

	/**
	 * Get collection params by 'additionalProperties' context.
	 *
	 * @param string $context
	 *
	 * @return array
	 */
	protected function get_collection_params_by_additional_props_context( $context ) {
		$result = [];

		$collection_params = $this->get_collection_params();

		foreach ( $collection_params as $collection_param_key => $collection_param ) {
			if ( isset( $collection_param['additionalProperties']['context'] ) && $context === $collection_param['additionalProperties']['context'] ) {
				$result[ $collection_param_key ] = $collection_param;
			}
		}

		return $result;
	}

	/**
	 * Register index endpoint.
	 */
	protected function register_index_endpoint() {
		$this->register_endpoint( new Endpoint\Index( $this ) );
	}

	/**
	 * Register endpoint.
	 *
	 * @param \Elementor\Data\Base\Endpoint $endpoint
	 *
	 * @return \Elementor\Data\Base\Endpoint
	 */
	protected function register_endpoint( Endpoint $endpoint ) {
		$command = $endpoint->get_full_command();

		if ( $endpoint instanceof Endpoint\Index ) {
			$this->index_endpoint = $endpoint;
		} else {
			$this->endpoints[ $command ] = $endpoint;
		}

		$format = $endpoint->get_format();

		// `$e.data.registerFormat()`.
		Manager::instance()->register_endpoint_format( $command, $format );

		return $endpoint;
	}

	/**
	 * Register a processor.
	 *
	 * That will be later attached to the endpoint class.
	 *
	 * @param string $processor_class
	 *
	 * @return \Elementor\Data\Base\Processor $processor_instance
	 */
	protected function register_processor( $processor_class ) {
		$processor_instance = new $processor_class( $this );

		// TODO: Validate processor instance.

		$command = $processor_instance->get_command();

		if ( ! isset( $this->processors[ $command ] ) ) {
			$this->processors[ $command ] = [];
		}

		$this->processors[ $command ] [] = $processor_instance;

		return $processor_instance;
	}

	/**
	 * Register.
	 *
	 * Endpoints & processors.
	 */
	protected function register() {
		$this->register_index_endpoint();
		$this->register_endpoints();

		// Aka hooks.
		$this->register_processors();
	}
}

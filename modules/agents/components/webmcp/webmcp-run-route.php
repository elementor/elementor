<?php

namespace Elementor\Modules\Agents\Components\Webmcp;

use Elementor\Modules\Agents\Components\Webmcp\Tools\Abstract_Webmcp_Tool;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Webmcp_Run_Route {

	const REST_NAMESPACE = 'elementor/v1';

	const REST_BASE = 'agents/webmcp/run';

	const ROUTE = self::REST_NAMESPACE . '/' . self::REST_BASE;

	const STATUS_BAD_REQUEST = 400;

	const STATUS_NOT_FOUND = 404;

	const STATUS_SERVER_ERROR = 500;

	const STATUS_SERVICE_UNAVAILABLE = 503;

	const ERROR_STATUS_MAP = [
		'ability_invalid_input' => self::STATUS_BAD_REQUEST,
		Abstract_Webmcp_Tool::ERROR_NOT_FOUND => self::STATUS_NOT_FOUND,
		Abstract_Webmcp_Tool::ERROR_UNAVAILABLE => self::STATUS_SERVICE_UNAVAILABLE,
	];

	private Webmcp_Browser_Tools $browser_tools;

	public function __construct( Webmcp_Browser_Tools $browser_tools ) {
		$this->browser_tools = $browser_tools;
	}

	public function register(): void {
		add_action( 'rest_api_init', [ $this, 'register_route' ] );
	}

	public function register_route(): void {
		register_rest_route( self::REST_NAMESPACE, '/' . self::REST_BASE, [
			'methods' => \WP_REST_Server::CREATABLE,
			'callback' => [ $this, 'handle' ],
			'permission_callback' => '__return_true',
			'args' => [
				'tool' => [
					'type' => 'string',
					'required' => true,
				],
				'input' => [
					'type' => [ 'object', 'null' ],
					'required' => false,
				],
			],
		] );
	}

	/**
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function handle( \WP_REST_Request $request ) {
		$ability = $this->browser_tools->get_cached_relevant_tools()[ $request->get_param( 'tool' ) ] ?? null;

		if ( ! $ability ) {
			return new \WP_Error(
				Abstract_Webmcp_Tool::ERROR_NOT_FOUND,
				__( 'Unknown tool.', 'elementor' ),
				[ 'status' => self::STATUS_NOT_FOUND ]
			);
		}

		$result = $ability->execute( $this->get_input( $ability, $request ) );

		if ( is_wp_error( $result ) ) {
			return $this->with_status( $result );
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Agents often send an empty object to tools that take no input, which the
	 * Abilities API rejects for abilities without an input schema.
	 *
	 * @return mixed
	 */
	private function get_input( \WP_Ability $ability, \WP_REST_Request $request ) {
		return empty( $ability->get_input_schema() ) ? null : $request->get_param( 'input' );
	}

	private function with_status( \WP_Error $error ): \WP_Error {
		$code = $error->get_error_code();

		if ( 'ability_invalid_permissions' === $code ) {
			$status = rest_authorization_required_code();
		} else {
			$status = self::ERROR_STATUS_MAP[ $code ] ?? self::STATUS_SERVER_ERROR;
		}

		return new \WP_Error( $code, $error->get_error_message(), [ 'status' => $status ] );
	}
}

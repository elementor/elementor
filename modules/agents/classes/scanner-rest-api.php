<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Api\Response_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scanner_Rest_Api {

	const API_NAMESPACE = 'elementor/v1';

	const ROUTE = '/agents-ready/scan';

	private Scanner_Orchestrator $orchestrator;

	public function __construct( Scanner_Orchestrator $orchestrator ) {
		$this->orchestrator = $orchestrator;
	}

	public function register_hooks(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, self::ROUTE, [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'scan' ],
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );
	}

	/**
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function scan() {
		$result = $this->orchestrator->run_scan();

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return Response_Builder::make( $result )->build();
	}
}

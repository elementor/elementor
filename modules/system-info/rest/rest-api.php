<?php
namespace Elementor\Modules\System_Info\Rest;

use Elementor\Core\Utils\Api\Response_Builder;
use Elementor\Plugin;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'system-info';

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE, [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_system_info' ],
			'permission_callback' => [ $this, 'check_permission' ],
		] );
	}

	public function check_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_system_info() {
		return Response_Builder::make( Plugin::$instance->system_info->get_reports_data() )->build();
	}
}

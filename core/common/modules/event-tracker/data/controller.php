<?php
namespace Elementor\Core\Common\Modules\EventTracker\Data;

use Elementor\Core\Common\Modules\Connect\Apps\Common_App;
use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Plugin;
use WP_REST_Server;
use Elementor\Data\V2\Base\Controller as Controller_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {

	public function get_name() {
		return 'send-event';
	}

	public function register_endpoints() {
		$this->index_endpoint->register_items_route( \WP_REST_Server::CREATABLE, [
			'event_data' => [
				'description' => 'All the recorded event data in JSON format',
				'type' => 'object',
				'required' => true,
			],
		] );
	}

	public function get_permission_callback( $request ) : bool {
		// TODO: CHECK FOR NONCE
		if ( WP_REST_Server::CREATABLE !== $request->get_method() ) {
			return false;
		}

		return false;
		// TODO: CHANGE RETURN TO THE FOLLOWING, REMOVE RETURN TRUE
		//return current_user_can( 'manage_options' );
	}

	public function create_items( $request ) {
		$request_body = $request->get_json_params();

		if ( empty( $request_body['event_data'] ) ) {
			return;
		}

		/** @var Library $library */
		$library = Plugin::$instance->common->get_component( 'connect' )->get_app( 'library' );

		if ( $library->is_connected() ) {
			$user_connect_data = get_user_option( get_current_user_id(), Common_App::OPTION_CONNECT_COMMON_DATA_KEY );

			// TODO: add user meta client_id here
			$request_body['event_data']['connect_id'] = $user_connect_data['client_id'];
		}
	}
}

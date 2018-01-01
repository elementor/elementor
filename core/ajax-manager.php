<?php
namespace Elementor\Core;

use Elementor\DB;
use Elementor\Plugin;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ajax_Manager {

	private $ajax_actions = [];
	private $response_data = [];
	private $current_action_id = null;

	public function add_response_data( $success, $data ) {
		$this->response_data[ $this->current_action_id ] = [
			'success' => $success,
			'data' => $data,
		];

		return $this;
	}

	public function send() {
		wp_send_json_success( [
			'responses' => $this->response_data,
		] );
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_ajax', [ $this, 'handle_ajax_request' ] );
	}

	public function register_ajax_action( $tag, $callback, $priority = 10 ) {
		if ( ! isset( $this->ajax_actions[ $tag ] ) ) {
			$this->ajax_actions[ $tag ] = [];
		}

		$this->ajax_actions[ $tag ][] = compact( 'tag', 'callback', 'priority' );
	}

	public function handle_ajax_request() {
		Plugin::$instance->editor->verify_ajax_nonce();

		do_action( 'elementor/ajax/register_actions', $this );

		if ( empty( $_REQUEST['actions'] ) ) {
			wp_send_json_error( new \WP_Error( 'Action Required' ) );
		}

		$responses = [];

		foreach ( $_REQUEST['actions'] as $id => $action_data ) {
			$this->current_action_id = $id;
			if ( ! isset( $this->ajax_actions[ $action_data['action'] ] ) ) {
				$responses[ $id ] = [
					'error' => 'Action Not Found',
				];

				continue;
			}

			try {
				$results = call_user_func( $this->ajax_actions[ $action_data['action'] ][0]['callback'], $this, $action_data['data'] );
				if ( $results ) {
					$this->add_response_data( true, $results );
				}
			} catch ( \Exception $e ) {
				$this->add_response_data( false, $e->getMessage() );
			}
		}

		$this->current_action_id = null;

		$this->send();
	}
}

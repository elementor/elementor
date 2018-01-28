<?php
namespace Elementor\Core;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Ajax_Manager {

	protected $ajax_actions = [];
	protected $response_data = [];
	protected $current_action_id = null;

	public function send() {
		wp_send_json_success( [
			'responses' => $this->response_data,
		] );
	}

	public function register_ajax_action( $tag, $callback ) {
		if ( ! did_action( 'elementor/ajax/register_actions' ) ) {
			doing_it_wrong( __METHOD__, __( 'Use `elementor/ajax/register_actions` hook to register ajax action.', 'elementor' ), '2.0.0' );
		}

		$this->ajax_actions[ $tag ] = compact( 'tag', 'callback' );
	}

	public function handle_ajax_request() {
		Plugin::$instance->editor->verify_ajax_nonce();

		if ( empty( $_REQUEST['actions'] ) ) {
			wp_send_json_error( new \WP_Error( 'missing_action', 'Action required.' ) );
		}

		/**
		 * Register ajax actions.
		 *
		 * Fires when an ajax request is received and verified.
		 *
		 * Used to register new ajax action handles.
		 *
		 * @since 2.0.0
		 *
		 * @param Ajax_Manager $this The ajax manager.
		 */
		do_action( 'elementor/ajax/register_actions', $this );

		$responses = [];
		$requests = json_decode( stripslashes( $_REQUEST['actions'] ), true );

		foreach ( $requests as $id => $action_data ) {
			$this->current_action_id = $id;
			if ( ! isset( $this->ajax_actions[ $action_data['action'] ] ) ) {
				$responses[ $id ] = [
					'error' => 'Action not found.',
				];

				continue;
			}

			try {
				$results = call_user_func( $this->ajax_actions[ $action_data['action'] ]['callback'], $action_data['data'], $this );
				if ( false === $results ) {
					$this->add_response_data( false );
				} else {
					$this->add_response_data( true, $results );
				}
			} catch ( \Exception $e ) {
				$this->add_response_data( false, $e->getMessage() );
			}
		}

		$this->current_action_id = null;

		$this->send();
	}

	protected function add_response_data( $success, $data = null ) {
		$this->response_data[ $this->current_action_id ] = [
			'success' => $success,
			'data' => $data,
		];

		return $this;
	}

	public function __construct() {
		add_action( 'wp_ajax_elementor_ajax', [ $this, 'handle_ajax_request' ] );
	}
}

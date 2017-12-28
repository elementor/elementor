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

		$this->register_ajax_action( 'save_builder', [ $this, 'ajax_save_builder' ] );
	}

	public function register_ajax_action( $tag, $callback, $priority = 10 ) {
		if ( ! isset( $this->ajax_actions[ $tag ] ) ) {
			$this->ajax_actions[ $tag ] = [];
		}

		$this->ajax_actions[ $tag ][] = compact( 'tag', 'callback', 'priority' );
	}

	public function handle_ajax_request() {
		Plugin::$instance->editor->verify_ajax_nonce();

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

	/**
	 * @since  1.0.0
	 * @access public
	 *
	 * @param Ajax_Manager $ajax_handler
	 * @param array $request
	 */
	public function ajax_save_builder( $ajax_handler, $request ) {
		if ( empty( $request['post_id'] ) ) {
			throw new \Exception('no_post_id' );
		}

		$post_id = $request['post_id'];

		if ( ! User::is_current_user_can_edit( $post_id ) ) {
			throw new \Exception('no_access' );
		}

		$status = DB::STATUS_DRAFT;

		if ( isset( $request['status'] ) && in_array( $request['status'], [ DB::STATUS_PUBLISH, DB::STATUS_PRIVATE, DB::STATUS_AUTOSAVE ] , true ) ) {
			$status = $request['status'];
		}

		$posted = json_decode( stripslashes( $request['data'] ), true );

		Plugin::$instance->db->save_editor( $post_id, $posted, $status );

		/**
		 * Filters the ajax data returned when saving the post on the builder.
		 *
		 * @since 1.0.0
		 *
		 * @param array $return_data The returned data. Default is an empty array.
		 */
		$return_data = apply_filters( 'elementor/ajax_save_builder/return_data', [], $post_id );

		$ajax_handler->add_response_data(
			true,
			array_merge( $return_data, [
					'config' => [
						'wp_preview' => [
							'url' => Utils::get_wp_preview_url( $post_id ),
						],
					],
				]
			)
		);
	}
}

<?php
namespace Elementor\Core;

use Elementor\Core\Utils\Exceptions;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor ajax manager.
 *
 * Elementor ajax manager handler class is responsible for handling Elementor
 * ajax requests, ajax responses and registering actions applied on them.
 *
 * @since 2.0.0
 */
class Ajax_Manager {

	/**
	 * Ajax actions.
	 *
	 * Holds all the register ajax action.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var array
	 */
	protected $ajax_actions = [];

	/**
	 * Ajax requests.
	 *
	 * Holds all the register ajax requests.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var array
	 */
	protected $requests = [];

	/**
	 * Ajax response data.
	 *
	 * Holds all the response data for all the ajax requests.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var array
	 */
	protected $response_data = [];

	/**
	 * Current ajax action ID.
	 *
	 * Holds all the ID for the current ajax action.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var string|null
	 */
	protected $current_action_id = null;

	/**
	 * Ajax success response.
	 *
	 * Send a JSON response data back to the ajax request, indicating success.
	 *
	 * @since 2.0.0
	 * @access protected
	 */
	protected function send_success() {
		wp_send_json_success( [
			'responses' => $this->response_data,
		] );
	}

	/**
	 * Ajax failure response.
	 *
	 * Send a JSON response data back to the ajax request, indicating failure.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @param null $code
	 */
	protected function send_error( $code = null ) {
		wp_send_json_error( [
			'responses' => $this->response_data,
		], $code );
	}

	/**
	 * Register ajax action.
	 *
	 * Add new actions for a specific ajax request and the callback function to
	 * be handle the response.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param string   $tag      Ajax request name/tag.
	 * @param callable $callback The callback function.
	 */
	public function register_ajax_action( $tag, $callback ) {
		if ( ! did_action( 'elementor/ajax/register_actions' ) ) {
			_doing_it_wrong( __METHOD__, esc_html( __( 'Use `elementor/ajax/register_actions` hook to register ajax action.', 'elementor' ) ), '2.0.0' );
		}

		$this->ajax_actions[ $tag ] = compact( 'tag', 'callback' );
	}

	/**
	 * Handle ajax request.
	 *
	 * Verify ajax nonce, and run all the registered actions for this request.
	 *
	 * Fired by `wp_ajax_elementor_ajax` action.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function handle_ajax_request() {
		if ( ! Plugin::$instance->editor->verify_request_nonce() ) {
			$this->add_response_data( false, __( 'Token Expired.', 'elementor' ) )
				->send_error( Exceptions::UNAUTHORIZED );
		}

		if ( empty( $_REQUEST['actions'] ) || empty( $_REQUEST['editor_post_id'] ) ) {
			$this->add_response_data( false, __( 'Actions and Post ID are required.', 'elementor' ) )
				->send_error( Exceptions::BAD_REQUEST );
		}

		$editor_post_id = absint( $_REQUEST['editor_post_id'] );

		if ( ! get_post( $editor_post_id ) ) {
			$this->add_response_data( false, __( 'Post not found.', 'elementor' ) )
				->send_error( Exceptions::NOT_FOUND );
		}

		Plugin::$instance->db->switch_to_post( $editor_post_id );

		/**
		 * Register ajax actions.
		 *
		 * Fires when an ajax request is received and verified.
		 *
		 * Used to register new ajax action handles.
		 *
		 * @since 2.0.0
		 *
		 * @param Ajax_Manager $this An instance of ajax manager.
		 */
		do_action( 'elementor/ajax/register_actions', $this );

		$this->requests = json_decode( stripslashes( $_REQUEST['actions'] ), true );

		foreach ( $this->requests as $id => $action_data ) {
			$this->current_action_id = $id;
			if ( ! isset( $this->ajax_actions[ $action_data['action'] ] ) ) {
				$this->add_response_data( false, __( 'Action not found.', 'elementor' ), Exceptions::BAD_REQUEST );
				continue;
			}

			if ( empty( $action_data['data']['editor_post_id'] ) ) {
				$action_data['data']['editor_post_id'] = $editor_post_id;
			}

			try {
				$results = call_user_func( $this->ajax_actions[ $action_data['action'] ]['callback'], $action_data['data'], $this );
				if ( false === $results ) {
					$this->add_response_data( false );
				} else {
					$this->add_response_data( true, $results );
				}
			} catch ( \Exception $e ) {
				$this->add_response_data( false, $e->getMessage(), $e->getCode() );
			}
		}

		$this->current_action_id = null;

		$this->send_success();
	}

	/**
	 * Get current action data.
	 *
	 * Retrieve the data for the current ajax request.
	 *
	 * @since 2.0.1
	 * @access public
	 *
	 * @return bool|mixed Ajax request data if action exist, False otherwise.
	 */
	public function get_current_action_data() {
		if ( ! $this->current_action_id ) {
			return false;
		}

		return $this->requests[ $this->current_action_id ];
	}

	/**
	 * Add response data.
	 *
	 * Add new response data to the array of all the ajax requests.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @param bool  $success True if the requests returned successfully, False
	 *                       otherwise.
	 * @param mixed $data    Optional. Response data. Default is null.
	 *
	 * @param int   $code    Optional. Response code. Default is 200.
	 *
	 * @return Ajax_Manager An instance of ajax manager.
	 */
	protected function add_response_data( $success, $data = null, $code = 200 ) {
		$this->response_data[ $this->current_action_id ] = [
			'success' => $success,
			'code' => $code,
			'data' => $data,
		];

		return $this;
	}

	/**
	 * Ajax manager constructor.
	 *
	 * Initializing Elementor ajax manager.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function __construct() {
		add_action( 'wp_ajax_elementor_ajax', [ $this, 'handle_ajax_request' ] );
	}
}

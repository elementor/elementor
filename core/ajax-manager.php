<?php
namespace Elementor\Core;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor ajax manager class.
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
	 * Current action ID.
	 *
	 * Holds all the ID for the current action.
	 *
	 * @since 2.0.0
	 * @access protected
	 *
	 * @var string|null
	 */
	protected $current_action_id = null;

	/**
	 * Send ajax request.
	 *
	 * Send a JSON response data back to the ajax request, indicating success.
	 *
	 * @since 2.0.0
	 * @access public
	 */
	public function send() {
		wp_send_json_success( [
			'responses' => $this->response_data,
		] );
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
	 *
	 * @return Ajax_Manager An instance of the ajax manager.
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
		 * @param Ajax_Manager $this An instance of ajax manager.
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
	 * @return Ajax_Manager An instance of ajax manager.
	 */
	protected function add_response_data( $success, $data = null ) {
		$this->response_data[ $this->current_action_id ] = [
			'success' => $success,
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

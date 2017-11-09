<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Heartbeat {

	/**
	 * Handle the post lock in the editor.
	 *
	 * @access public
	 * @since 1.0.0
	 *
	 * @param array $response
	 * @param array $data
	 *
	 * @return array
	 */
	public function heartbeat_received( $response, $data ) {
		if ( isset( $data['elementor_post_lock']['post_ID'] ) ) {
			$post_id = $data['elementor_post_lock']['post_ID'];
			$locked_user = Plugin::$instance->editor->get_locked_user( $post_id );

			if ( ! $locked_user || ! empty( $data['elementor_force_post_lock'] ) ) {
				Plugin::$instance->editor->lock_post( $post_id );
			} else {
				$response['locked_user'] = $locked_user->display_name;
			}

			$response['elementorNonce'] = Plugin::$instance->editor->create_nonce();
		}
		return $response;
	}

	/**
	 * @access public
	 */
	public function refresh_nonces( $response, $data ) {
		if ( isset( $data['elementor_post_lock']['post_ID'] ) ) {
			$response['elementor-refresh-nonces'] = [
				'elementorNonce' => Plugin::$instance->editor->create_nonce(),
				'heartbeatNonce' => wp_create_nonce( 'heartbeat-nonce' ),
			];
		}

		return $response;
	}

	/**
	 * Heartbeat constructor.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	public function __construct() {
		add_filter( 'heartbeat_received', [ $this, 'heartbeat_received' ], 10, 2 );
		add_filter( 'wp_refresh_nonces', [ $this, 'refresh_nonces' ], 30, 2 );
	}
}

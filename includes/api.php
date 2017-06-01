<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Api {

	public static $api_info_url = 'http://my.elementor.com/api/v1/info/';
	private static $api_feedback_url = 'http://my.elementor.com/api/v1/feedback/';
	private static $api_get_template_content_url = 'http://my.elementor.com/api/v1/templates/%d';

	/**
	 * This function notifies the user of upgrade notices, new templates and contributors
	 *
	 * @param bool $force
	 *
	 * @return array|bool
	 */
	private static function _get_info_data( $force = false ) {
		$cache_key = 'elementor_remote_info_api_data_' . ELEMENTOR_VERSION;
		$info_data = get_transient( $cache_key );

		if ( $force || false === $info_data ) {
			$response = wp_remote_post( self::$api_info_url, [
				'timeout' => 25,
				'body' => [
					// Which API version is used
					'api_version' => ELEMENTOR_VERSION,
					// Which language to return
					'site_lang' => get_bloginfo( 'language' ),
				],
			] );

			if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
				set_transient( $cache_key, [], 2 * HOUR_IN_SECONDS );

				return false;
			}

			$info_data = json_decode( wp_remote_retrieve_body( $response ), true );
			if ( empty( $info_data ) || ! is_array( $info_data ) ) {
				set_transient( $cache_key, [], 2 * HOUR_IN_SECONDS );

				return false;
			}

			if ( isset( $info_data['templates'] ) ) {
				update_option( 'elementor_remote_info_templates_data', $info_data['templates'], 'no' );
				unset( $info_data['templates'] );
			}
			set_transient( $cache_key, $info_data, 12 * HOUR_IN_SECONDS );
		}

		return $info_data;
	}

	public static function get_upgrade_notice() {
		$data = self::_get_info_data();
		if ( empty( $data['upgrade_notice'] ) )
			return false;

		return $data['upgrade_notice'];
	}

	public static function get_templates_data() {
		self::_get_info_data();

		$templates = get_option( 'elementor_remote_info_templates_data' );
		if ( empty( $templates ) )
			return [];

		return $templates;
	}

	public static function get_template_content( $template_id ) {
		$url = sprintf( self::$api_get_template_content_url, $template_id );

		$body_args = [
			// Which API version is used
			'api_version' => ELEMENTOR_VERSION,
			// Which language to return
			'site_lang' => get_bloginfo( 'language' ),
		];

		$body_args = apply_filters( 'elementor/api/get_templates/body_args', $body_args );

		$response = wp_remote_get( $url, [
			'timeout' => 40,
			'body' => $body_args,
		] );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$response_code = (int) wp_remote_retrieve_response_code( $response );

		if ( 200 !== $response_code ) {
			return new \WP_Error( 'response_code_error', 'The request returned with a status code of ' . $response_code );
		}

		$template_content = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( isset( $template_content['error'] ) ) {
			return new \WP_Error( 'response_error', $template_content['error'] );
		}

		if ( empty( $template_content['data'] ) && empty( $template_content['content'] ) ) {
			return new \WP_Error( 'template_data_error', 'An invalid data was returned' );
		}

		return $template_content;
	}

	public static function send_feedback( $feedback_key, $feedback_text ) {
		return wp_remote_post( self::$api_feedback_url, [
			'timeout' => 30,
			'body' => [
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
				'feedback_key' => $feedback_key,
				'feedback' => $feedback_text,
			],
		] );
	}

	public function ajax_reset_api_data() {
		check_ajax_referer( 'elementor_reset_library', '_nonce' );

		self::_get_info_data( true );

		wp_send_json_success();
	}

	public static function init() {
		add_action( 'wp_ajax_elementor_reset_library', [ __CLASS__, 'ajax_reset_api_data' ] );
	}
}

Api::init();

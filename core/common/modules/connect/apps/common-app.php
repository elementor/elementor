<?php
namespace Elementor\Core\Common\Modules\Connect\Apps;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Common_App extends Base_User_App {
	const OPTION_CONNECT_COMMON_DATA_KEY = self::OPTION_NAME_PREFIX . 'common_data';

	protected static $common_data = null;

	/**
	 * @since 2.3.0
	 * @access public
	 */
	public function get_option_name() {
		return static::OPTION_NAME_PREFIX . 'common_data';
	}

	/**
	 * @since 2.3.0
	 * @access protected
	 */
	protected function init_data() {
		if ( is_null( self::$common_data ) ) {
			self::$common_data = get_user_option( static::get_option_name() );

			if ( ! self::$common_data ) {
				self::$common_data = [];
			}
		}

		$this->data = & self::$common_data;
	}

	public function action_reset() {
		delete_user_option( get_current_user_id(), static::OPTION_CONNECT_COMMON_DATA_KEY );

		parent::action_reset();
	}

	public static function get_connect_user_id_from_access_token( $token ) {
		if ( ! is_string( $token ) ) {
			return null;
		}

		$parts = explode( '.', $token );

		if ( count( $parts ) !== 3 ) {
			return null;
		}

		try {
			$payload_encoded = $parts[1];

			$payload_encoded = str_pad( $payload_encoded, strlen( $payload_encoded ) + ( 4 - strlen( $payload_encoded ) % 4 ) % 4, '=' );

			$payload_json = base64_decode( strtr( $payload_encoded, '-_', '+/' ), true );

			$payload = json_decode( $payload_json, true );

			if ( ! isset( $payload['sub'] ) ) {
				return null;
			}

			return $payload['sub'];
		} catch ( \Exception $e ) {
			error_log( 'JWT Decoding Error: ' . $e->getMessage() );
			return null;
		}
	}

	protected function get_connect_user_id() {
		return self::get_connect_user_id_from_access_token( $this->get( 'access_token' ) );
	}
}

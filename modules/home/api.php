<?php
namespace Elementor\Modules\Home;

class API {

	const HOME_SCREEN_DATA_URL = 'https://assets.elementor.com/home-screen/v1/home-screen.json';

	public static function get_home_screen_items( $force_request = false ): array {
		$json_data = self::get_transient( '_elementor_home_screen_data' );

		if ( $force_request || false === $json_data ) {
			$json_data = static::fetch_data();
			static::set_transient( '_elementor_home_screen_data', $json_data, '+1 hour' );
		}

		return $json_data;
	}

	private static function fetch_data(): array {
		$response = wp_remote_get( self::HOME_SCREEN_DATA_URL );

		if ( is_wp_error( $response ) ) {
			return [];
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $data['home-screen'] ) || ! is_array( $data['home-screen'] ) ) {
			return [];
		}

		return $data['home-screen'];
	}

	private static function get_transient( $cache_key ) {
		$cache = get_option( $cache_key );

		if ( empty( $cache['timeout'] ) ) {
			return false;
		}

		if ( current_time( 'timestamp' ) > $cache['timeout'] ) {
			return false;
		}

		return json_decode( $cache['value'], true );
	}

	private static function set_transient( $cache_key, $value, $expiration = '+12 hours' ): bool {
		$data = [
			'timeout' => strtotime( $expiration, current_time( 'timestamp' ) ),
			'value' => json_encode( $value ),
		];

		return update_option( $cache_key, $data, false );
	}
}

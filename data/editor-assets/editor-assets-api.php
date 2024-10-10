<?php
namespace Elementor\Data\EditorAssets;

class EditorAssetsAPI {
    public static function config( $key ): string {
        $config = [
            'ASSETS_DATA_URL' => 'https://assets.elementor.com/home-screen/v1/home-screen.json',
            'ASSETS_DATA_TRANSIENT_KEY' => '_elementor_home_screen_data',
            'ASSETS_DATA_KEY' => 'home-screen',
        ];

        return $config[ $key ] ?? '';
    }

	public static function get_assets_data( $force_request = false ): array {
		$assets_data = self::get_transient( static::config( 'ASSETS_DATA_TRANSIENT_KEY' ) );

		if ( $force_request || false === $assets_data ) {
			$assets_data = static::fetch_data();
			static::set_transient( static::config( 'ASSETS_DATA_TRANSIENT_KEY' ), $assets_data, '+1 hour' );
		}

		return $assets_data;
	}

	private static function fetch_data(): array {
		$response = wp_remote_get( static::config( 'ASSETS_DATA_URL' ) );

		if ( is_wp_error( $response ) ) {
			return [];
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( empty( $data[ static::config( 'ASSETS_DATA_KEY' ) ] ) || ! is_array( $data[ static::config( 'ASSETS_DATA_KEY' ) ] ) ) {
			return [];
		}

		return $data[ static::config( 'ASSETS_DATA_KEY' ) ];
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

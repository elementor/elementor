<?php
namespace Elementor\Includes;

class EditorAssetsAPI {
	protected array $config;

	const ASSETS_DATA_TRANSIENT_KEY = 'ASSETS_DATA_TRANSIENT_KEY';

	const ASSETS_DATA_URL = 'ASSETS_DATA_URL';

	const ASSETS_DATA_KEY = 'ASSETS_DATA_KEY';

	public function __construct( array $config ) {
		$this->config = $config;
	}

	public function config( $key ): string {
		return $this->config[ $key ] ?? '';
	}

	public function get_assets_data( $force_request = false, bool $skip_cache = false ): array {
		if ( $skip_cache ) {
			return $this->fetch_data();
		}

		$assets_data = $this->get_transient( $this->config( static::ASSETS_DATA_TRANSIENT_KEY ) );

		if ( $force_request || false === $assets_data ) {
			$fresh_data = $this->fetch_data();

			if ( empty( $fresh_data ) ) {
				return ! empty( $assets_data ) ? $assets_data : [];
			}

			$assets_data = $fresh_data;
			$this->set_transient( $this->config( static::ASSETS_DATA_TRANSIENT_KEY ), $assets_data, '+1 hour' );
		}

		return $assets_data;
	}

	private function fetch_data(): array {
		$response = wp_remote_get( $this->config( static::ASSETS_DATA_URL ) );

		if ( is_wp_error( $response ) || 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return [];
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! $this->has_valid_data( $data ) ) {
			return [];
		}

		return $data[ $this->config( static::ASSETS_DATA_KEY ) ];
	}

	private function get_transient( $cache_key ) {
		$cache = get_option( $cache_key );

		if ( empty( $cache['timeout'] ) ) {
			return false;
		}

		if ( current_time( 'timestamp' ) > $cache['timeout'] ) {
			return false;
		}

		return json_decode( $cache['value'], true );
	}

	private function set_transient( $cache_key, $value, $expiration = '+12 hours' ): bool {
		$data = [
			'timeout' => strtotime( $expiration, current_time( 'timestamp' ) ),
			'value' => wp_json_encode( $value ),
		];

		return update_option( $cache_key, $data, false );
	}

	private function has_valid_data( $data ): bool {
		if ( ! is_array( $data ) ) {
			return false;
		}
		$key = $this->config( static::ASSETS_DATA_KEY );
		return ! empty( $data[ $key ] ) && is_array( $data[ $key ] );
	}

	public static function has_valid_nested_array( $data, array $nested_array_keys, bool $require_non_empty = true ): bool {
		if ( empty( $nested_array_keys ) ) {
			if ( ! is_array( $data ) ) {
				return false;
			}
			if ( $require_non_empty && empty( $data ) ) {
				return false;
			}

			return true;
		}

		if ( ! is_array( $data ) ) {
			return false;
		}

		$current = $data;
		$depth = count( $nested_array_keys );

		foreach ( $nested_array_keys as $index => $nested_key ) {
			if ( ! is_array( $current ) || ! array_key_exists( $nested_key, $current ) ) {
				return false;
			}

			$current = $current[ $nested_key ];
			if ( $index === $depth - 1 ) {
				if ( ! is_array( $current ) ) {
					return false;
				}

				if ( $require_non_empty && empty( $current ) ) {
					return false;
				}

				return true;
			}
		}

		return true;
	}
}

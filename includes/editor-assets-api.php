<?php
namespace Elementor\Includes;

class EditorAssetsAPI {
	protected array $config;

	const ASSETS_DATA_TRANSIENT_KEY = 'ASSETS_DATA_TRANSIENT_KEY';

	const ASSETS_DATA_URL = 'ASSETS_DATA_URL';

	const ASSETS_DATA_KEY = 'ASSETS_DATA_KEY';

	const ASSETS_DATA_EXPIRATION = 'ASSETS_DATA_EXPIRATION';

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
			$this->set_transient( $this->config( static::ASSETS_DATA_TRANSIENT_KEY ), $assets_data, $this->get_expiration_time() );
		}

		return $assets_data;
	}

	private function fetch_data(): array {
		$response = wp_remote_get( $this->config( static::ASSETS_DATA_URL ) );

		if ( is_wp_error( $response ) || WP_Http::OK !== (int) wp_remote_retrieve_response_code( $response ) ) {
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

	private function get_expiration_time(): string {
		$expiration = $this->config( static::ASSETS_DATA_EXPIRATION );
		return $expiration ? $expiration : '+1 hour';
	}

	private function has_valid_data( $data ): bool {
		if ( ! is_array( $data ) ) {
			return false;
		}

		$key = $this->config( static::ASSETS_DATA_KEY );
		return static::is_non_empty_array( $data[ $key ] ?? null );
	}

	public static function has_valid_nested_array( $data, array $nested_array_path ): bool {
		$current = $data;

		foreach ( $nested_array_path as $nested_key ) {
			if ( ! is_array( $current ) || ! array_key_exists( $nested_key, $current ) ) {
				return false;
			}
			$current = $current[ $nested_key ];
		}

		if ( ! static::is_non_empty_array( $current ) ) {
			return false;
		}

		return true;
	}

	public static function is_valid_data( $data ): bool {
		return static::is_non_empty_array( $data );
	}

	private static function is_non_empty_array( $value ): bool {
		return is_array( $value ) && ! empty( $value );
	}
}

<?php
namespace Elementor\Includes;

class EditorAssetsAPI {
	protected array $config;

	const ASSETS_DATA_TRANSIENT_KEY = 'ASSETS_DATA_TRANSIENT_KEY';

	const ASSETS_DATA_URL = 'ASSETS_DATA_URL';

	const ASSETS_DATA_KEY = 'ASSETS_DATA_KEY';

	const ASSETS_DATA_EXPIRATION = 'ASSETS_DATA_EXPIRATION';

	const DEFAULT_EXPIRATION_TIME = '+1 hour';

	const PRODUCTION_URL = 'https://assets.elementor.com';
	const STAGING_URL = 'https://assets.stg.elementor.red';
	const DEV_URL = 'https://assets.dev.builder.elementor.red';

	private static ?array $allowed_hosts = null;

	public function __construct( array $config ) {
		$this->config = $config;
	}

	public function config( $key ): string {
		return $this->config[ $key ] ?? '';
	}

	public function get_assets_data( $force_request = false ): array {
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
		$url = $this->config( static::ASSETS_DATA_URL );
		$data = self::do_safe_get_request( $url );

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

	private function set_transient( $cache_key, $value, $expiration ): bool {
		$data = [
			'timeout' => strtotime( $expiration, current_time( 'timestamp' ) ),
			'value' => wp_json_encode( $value ),
		];

		return update_option( $cache_key, $data, false );
	}

	private function get_expiration_time(): string {
		$expiration = $this->config( static::ASSETS_DATA_EXPIRATION );
		return $expiration ? $expiration : static::DEFAULT_EXPIRATION_TIME;
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

	private static function get_allowed_hosts(): array {
		if ( null !== self::$allowed_hosts ) {
			return self::$allowed_hosts;
		}

		self::$allowed_hosts = array_values( array_filter( array_map(
			fn( $url ) => wp_parse_url( $url, PHP_URL_HOST ),
			[ self::PRODUCTION_URL, self::STAGING_URL, self::DEV_URL ]
		) ) );

		return self::$allowed_hosts;
	}

	public static function is_allowed_url( $url ): bool {
		if ( ! is_string( $url ) || ! wp_http_validate_url( $url ) ) {
			return false;
		}

		if ( 'https' !== wp_parse_url( $url, PHP_URL_SCHEME ) ) {
			return false;
		}

		return in_array( wp_parse_url( $url, PHP_URL_HOST ), self::get_allowed_hosts(), true );
	}

	public static function do_safe_get_request( $url ) {
		if ( ! self::is_allowed_url( $url ) ) {
			return null;
		}

		$response = wp_safe_remote_get( $url, [
			'timeout' => 5,
			'limit_response_size' => 512 * KB_IN_BYTES,
		] );

		if ( is_wp_error( $response ) || \WP_Http::OK !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		return json_decode( wp_remote_retrieve_body( $response ), true );
	}
}

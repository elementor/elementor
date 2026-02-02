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

	public function get_assets_data( $force_request = false ): array {
		$cache_key = $this->get_cache_key();
		$assets_data = $this->get_transient( $cache_key );

		if ( $force_request || false === $assets_data ) {
			$assets_data = $this->fetch_data();
			$this->set_transient( $cache_key, $assets_data, '+1 hour' );
		}

		return $assets_data;
	}

	private function fetch_data(): array {
		$base_url = $this->config( static::ASSETS_DATA_URL );
		$localized_url = $this->get_localized_url( $base_url );

		if ( $localized_url ) {
			$localized_data = $this->fetch_data_from_url( $localized_url );
			if ( ! empty( $localized_data ) ) {
				return $localized_data;
			}
		}

		return $this->fetch_data_from_url( $base_url );
	}

	private function fetch_data_from_url( $url ): array {
		$response = wp_remote_get( $url );

		if ( is_wp_error( $response ) ) {
			return [];
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! is_array( $data ) ) {
			return [];
		}

		if ( empty( $data[ $this->config( static::ASSETS_DATA_KEY ) ] ) || ! is_array( $data[ $this->config( static::ASSETS_DATA_KEY ) ] ) ) {
			return [];
		}

		return $data[ $this->config( static::ASSETS_DATA_KEY ) ];
	}

	private function get_locale(): string {
		$locale = determine_locale();
		if ( empty( $locale ) ) {
			$locale = get_locale();
		}

		return apply_filters( 'elementor/editor_assets_locale', $locale );
	}

	private function get_cache_key(): string {
		$base_key = $this->config( static::ASSETS_DATA_TRANSIENT_KEY );
		$locale = $this->get_locale();

		if ( empty( $locale ) || 'en_US' === $locale ) {
			return $base_key;
		}

		$suffix = strtolower( str_replace( '-', '_', $locale ) );
		return $base_key . '_' . $suffix;
	}

	private function get_localized_url( $base_url ): string {
		$locale = $this->get_locale();

		if ( empty( $locale ) || 'en_US' === $locale ) {
			return '';
		}

		$normalized_locale = str_replace( '-', '_', $locale );

		if ( '.json' !== substr( $base_url, -5 ) ) {
			return '';
		}

		return substr( $base_url, 0, -5 ) . '.' . $normalized_locale . '.json';
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
}

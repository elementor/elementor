<?php

namespace Elementor\Modules\GuidedTours;

use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tours_Repository {
	const INDEX_URL = EditorAssetsAPI::PRODUCTION_URL . '/tours/index.json';
	const INDEX_ASSETS_PATH = 'tours/index.json';
	const CACHE_KEY_PREFIX = 'elementor_guided_tours_';
	const CACHE_EXPIRATION = DAY_IN_SECONDS;
	const FAILED_FETCH_CACHE_EXPIRATION = 30 * MINUTE_IN_SECONDS;

	private const ALLOWED_SIDES = [ 'top', 'right', 'bottom', 'left' ];

	public function get_eligible_tour( string $screen_id, array $roles ): array {
		$index = $this->load_assets_json( self::INDEX_ASSETS_PATH );

		if ( ! is_array( $index ) || empty( $index['tours'] ) || ! is_array( $index['tours'] ) ) {
			return [];
		}

		foreach ( $index['tours'] as $tour_id => $tour_reference ) {
			$tour = $this->get_tour( $tour_id, $tour_reference );

			if ( $this->is_eligible( $tour, $screen_id, $roles ) ) {
				return $tour;
			}
		}

		return [];
	}

	private function get_tour( $tour_id, $tour_reference ): array {
		if (
			! is_string( $tour_id ) ||
			! is_array( $tour_reference ) ||
			true !== ( $tour_reference['is_active'] ?? null ) ||
			! $this->is_valid_tour_path( $tour_reference['file'] ?? null )
		) {
			return [];
		}

		$tour = $this->load_assets_json( $tour_reference['file'] );

		if (
			! is_array( $tour ) ||
			true !== ( $tour['is_active'] ?? null ) ||
			( $tour['id'] ?? null ) !== $tour_id
		) {
			return [];
		}

		return $this->normalize_tour( $tour );
	}

	private function normalize_tour( array $tour ): array {
		if (
			empty( $tour['version'] ) ||
			! is_array( $tour['screens'] ?? null ) ||
			! is_array( $tour['roles'] ?? null ) ||
			! is_array( $tour['steps'] ?? null )
		) {
			return [];
		}

		$steps = [];

		foreach ( $tour['steps'] as $step ) {
			$normalized_step = $this->normalize_step( $step );

			if ( $normalized_step ) {
				$steps[] = $normalized_step;
			}
		}

		if ( empty( $steps ) ) {
			return [];
		}

		return [
			'id' => sanitize_key( $tour['id'] ),
			'version' => absint( $tour['version'] ),
			'is_active' => true,
			'screens' => array_values( array_filter( array_map( 'sanitize_key', $tour['screens'] ) ) ),
			'roles' => array_values( array_filter( array_map( 'sanitize_key', $tour['roles'] ) ) ),
			'steps' => $steps,
		];
	}

	private function normalize_step( $step ): array {
		if (
			! is_array( $step ) ||
			empty( $step['id'] ) ||
			empty( $step['screen'] ) ||
			empty( $step['selector'] ) ||
			empty( $step['title'] ) ||
			empty( $step['description'] ) ||
			! in_array( $step['side'] ?? '', self::ALLOWED_SIDES, true )
		) {
			return [];
		}

		$normalized = [
			'id' => sanitize_key( $step['id'] ),
			'screen' => sanitize_key( $step['screen'] ),
			'selector' => sanitize_text_field( $step['selector'] ),
			'title' => esc_html( sanitize_text_field( $step['title'] ) ),
			'description' => esc_html( sanitize_text_field( $step['description'] ) ),
			'side' => $step['side'],
		];

		foreach ( [ 'next_url', 'url' ] as $url_key ) {
			$admin_url = $this->normalize_admin_url( $step[ $url_key ] ?? '' );

			if ( $admin_url ) {
				$normalized[ $url_key ] = $admin_url;
			}
		}

		return $normalized;
	}

	private function normalize_admin_url( $admin_url ): string {
		if ( ! is_string( $admin_url ) || '' === $admin_url ) {
			return '';
		}

		$admin_url = sanitize_text_field( $admin_url );

		if ( ! preg_match( '/^[a-z0-9_\\-]+\\.php(\\?[a-z0-9_\\-]+=[a-z0-9_\\-]+(&[a-z0-9_\\-]+=[a-z0-9_\\-]+)*)?$/', $admin_url ) ) {
			return '';
		}

		return $admin_url;
	}

	private function is_eligible( array $tour, string $screen_id, array $roles ): bool {
		return ! empty( $tour['version'] )
			&& in_array( $screen_id, $tour['screens'] ?? [], true )
			&& (bool) array_intersect( $roles, $tour['roles'] ?? [] );
	}

	private function is_valid_tour_path( $path ): bool {
		return is_string( $path ) && 1 === preg_match( '/^tours\/[a-z0-9-]+\.json$/', $path );
	}

	private function load_assets_json( string $assets_path ): array {
		$cache_key = self::CACHE_KEY_PREFIX . md5( $assets_path );
		$cached = get_transient( $cache_key );

		if ( is_array( $cached ) ) {
			return $cached;
		}

		$url = EditorAssetsAPI::PRODUCTION_URL . '/' . ltrim( $assets_path, '/' );
		$data = EditorAssetsAPI::do_safe_get_request( $url );
		$data = is_array( $data ) ? $data : [];

		set_transient( $cache_key, $data, empty( $data ) ? self::FAILED_FETCH_CACHE_EXPIRATION : self::CACHE_EXPIRATION );

		return $data;
	}
}

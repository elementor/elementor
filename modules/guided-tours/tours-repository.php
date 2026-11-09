<?php

namespace Elementor\Modules\GuidedTours;

use Elementor\Includes\EditorAssetsAPI;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Tours_Repository {
	const INDEX_URL = EditorAssetsAPI::PRODUCTION_URL . '/tours/index.json';
	const INDEX_ASSETS_PATH = 'tours/index.json';

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
			empty( $step['selector'] ) ||
			empty( $step['title'] ) ||
			empty( $step['description'] ) ||
			! in_array( $step['side'] ?? '', self::ALLOWED_SIDES, true )
		) {
			return [];
		}

		return [
			'id' => sanitize_key( $step['id'] ),
			'selector' => sanitize_text_field( $step['selector'] ),
			'title' => sanitize_text_field( $step['title'] ),
			'description' => sanitize_text_field( $step['description'] ),
			'side' => $step['side'],
		];
	}

	private function is_eligible( array $tour, string $screen_id, array $roles ): bool {
		return ! empty( $tour['version'] )
			&& in_array( $screen_id, $tour['screens'] ?? [], true )
			&& (bool) array_intersect( $roles, $tour['roles'] ?? [] );
	}

	private function is_valid_tour_path( $path ): bool {
		return is_string( $path ) && 1 === preg_match( '/^tours\/[a-z0-9-]+\.json$/', $path );
	}

	/**
	 * Dev-only: read tour JSON from sibling `wp-content/plugins/editor-assets`.
	 * Remove before release — production uses CDN only.
	 */
	private function should_use_local_assets(): bool {
		$use_local = false;

		if ( defined( 'ELEMENTOR_GUIDED_TOURS_USE_LOCAL_ASSETS' ) ) {
			$use_local = (bool) ELEMENTOR_GUIDED_TOURS_USE_LOCAL_ASSETS;
		} elseif ( defined( 'WP_DEBUG' ) && WP_DEBUG && null !== self::get_local_tours_directory() ) {
			$use_local = true;
		}

		return (bool) apply_filters( 'elementor/guided-tours/use_local_assets', $use_local );
	}

	private static function get_local_tours_directory(): ?string {
		$candidates = [
			WP_PLUGIN_DIR . '/editor-assets/src/tours',
			WP_PLUGIN_DIR . '/editor-assets/out/tours',
		];

		foreach ( $candidates as $directory ) {
			if ( is_readable( $directory . '/index.json' ) ) {
				return $directory;
			}
		}

		return null;
	}

	private function load_assets_json( string $assets_path ): array {
		if ( $this->should_use_local_assets() ) {
			return $this->read_local_json( $assets_path );
		}

		$url = EditorAssetsAPI::PRODUCTION_URL . '/' . ltrim( $assets_path, '/' );
		$data = EditorAssetsAPI::do_safe_get_request( $url );

		return is_array( $data ) ? $data : [];
	}

	private function read_local_json( string $assets_path ): array {
		$file = $this->resolve_local_file_path( $assets_path );

		if ( ! $file ) {
			return [];
		}

		$decoded = json_decode( file_get_contents( $file ), true );

		return is_array( $decoded ) ? $decoded : [];
	}

	private function resolve_local_file_path( string $assets_path ): ?string {
		$directory = self::get_local_tours_directory();

		if ( ! $directory ) {
			return null;
		}

		$relative = preg_replace( '#^tours/#', '', $assets_path );

		if (
			! is_string( $relative )
			|| ( 'index.json' !== $relative && ! preg_match( '/^[a-z0-9-]+\.json$/', $relative ) )
		) {
			return null;
		}

		$full_path = $directory . '/' . $relative;

		return is_readable( $full_path ) ? $full_path : null;
	}
}

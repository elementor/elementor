<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Slug_Normalizer {

	public function normalize( string $slug ): string {
		if ( 0 !== strpos( $slug, 'http' ) ) {
			return $slug;
		}

		$parsed = wp_parse_url( $slug );
		$path = basename( $parsed['path'] ?? '' );

		if ( ! empty( $parsed['query'] ) ) {
			$path .= '?' . $parsed['query'];
		}

		if ( ! empty( $parsed['fragment'] ) ) {
			$path .= '#' . $parsed['fragment'];
		}

		return $path;
	}

	public function is_excluded( string $item_slug, array $excluded_slugs ): bool {
		if ( in_array( $item_slug, $excluded_slugs, true ) ) {
			return true;
		}

		$normalized_slug = $this->normalize( $item_slug );

		return in_array( $normalized_slug, $excluded_slugs, true );
	}
}

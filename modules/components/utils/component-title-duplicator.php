<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Components_REST_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Active titles are read from the database once and kept in a static map, so a kit
 * with many components is resolved without a query per component. Every resolved
 * title is claimed into the map; `reset()` must be called at import run boundaries.
 */
class Component_Title_Duplicator {
	const SUFFIX = '_DUP';
	const TITLE_MAX_LENGTH = 200;
	const FIRST_ATTEMPT = 1;
	const MAX_ATTEMPTS = Components_REST_API::MAX_COMPONENTS + 1;

	private static ?array $taken_titles = null;

	public static function reset(): void {
		self::$taken_titles = null;
	}

	public static function get_unique_title( string $title, int $exclude_id = 0 ): string {
		self::load_once( $exclude_id );

		$base = sanitize_text_field( $title );
		$candidate = $base;
		$attempt = self::FIRST_ATTEMPT;

		while ( self::is_taken( $candidate ) && $attempt <= self::MAX_ATTEMPTS ) {
			$candidate = self::build_title( $base, $attempt );
			++$attempt;
		}

		self::claim( $candidate );

		return $candidate;
	}

	private static function load_once( int $exclude_id ): void {
		if ( null !== self::$taken_titles ) {
			return;
		}

		self::$taken_titles = array_fill_keys( Components_Repository::make()->get_active_titles( $exclude_id ), true );
	}

	private static function is_taken( string $title ): bool {
		return isset( self::$taken_titles[ mb_strtolower( $title ) ] );
	}

	private static function claim( string $title ): void {
		self::$taken_titles[ mb_strtolower( $title ) ] = true;
	}

	private static function build_title( string $base, int $attempt ): string {
		$suffix = self::FIRST_ATTEMPT === $attempt ? self::SUFFIX : self::SUFFIX . '_' . $attempt;

		return mb_substr( $base, 0, self::TITLE_MAX_LENGTH - mb_strlen( $suffix ) ) . $suffix;
	}
}

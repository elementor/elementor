<?php
namespace Elementor\Core\Utils\ImportExport;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Duplicate_Term {

	const MAX_LENGTH = 200;

	const SLUG_SUFFIX = '-duplicate';

	const NAME_SUFFIX = ' duplicate';

	const MAX_ATTEMPTS = 100;

	public static function generate( string $slug, string $name, string $taxonomy ): array {
		$base_slug = static::strip_slug_suffix( sanitize_title( $slug ) );
		$base_name = static::strip_name_suffix( $name );
		$counter = 1;

		do {
			$candidate = [
				'slug' => static::build_slug( $base_slug, $counter ),
				'name' => static::build_name( $base_name, $counter ),
			];

			++$counter;
		} while ( $counter <= static::MAX_ATTEMPTS && term_exists( $candidate['slug'], $taxonomy ) );

		return $candidate;
	}

	private static function strip_slug_suffix( string $slug ): string {
		$stripped = preg_replace( '/(?:' . preg_quote( static::SLUG_SUFFIX, '/' ) . ')+(?:-\d+)?$/', '', $slug );

		return '' === $stripped ? $slug : $stripped;
	}

	private static function strip_name_suffix( string $name ): string {
		$stripped = preg_replace( '/(?:' . preg_quote( static::NAME_SUFFIX, '/' ) . ')+(?: \d+)?$/u', '', $name );

		return '' === $stripped ? $name : $stripped;
	}

	private static function build_slug( string $base_slug, int $counter ): string {
		$suffix = static::SLUG_SUFFIX . static::get_counter_suffix( $counter, '-' );
		$base = substr( $base_slug, 0, static::MAX_LENGTH - strlen( $suffix ) );
		$base = preg_replace( '/%[0-9a-f]?$/i', '', $base );

		return rtrim( $base, '-' ) . $suffix;
	}

	private static function build_name( string $base_name, int $counter ): string {
		$suffix = static::NAME_SUFFIX . static::get_counter_suffix( $counter, ' ' );
		$base = mb_substr( $base_name, 0, static::MAX_LENGTH - mb_strlen( $suffix ) );

		return rtrim( $base ) . $suffix;
	}

	private static function get_counter_suffix( int $counter, string $separator ): string {
		return 1 === $counter ? '' : $separator . $counter;
	}
}

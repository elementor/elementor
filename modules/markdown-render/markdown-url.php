<?php
namespace Elementor\Modules\MarkdownRender;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Url {

	const MARKDOWN_INDEX_FILENAME = 'index.md';

	public static function get_url_for_post( int $post_id ): string {
		if ( self::uses_plain_permalinks() ) {
			return add_query_arg( 'format', 'markdown', get_permalink( $post_id ) );
		}

		$permalink = get_permalink( $post_id );

		if ( ! is_string( $permalink ) || '' === $permalink ) {
			return '';
		}

		return self::from_permalink( $permalink );
	}

	public static function from_permalink( string $permalink ): string {
		if ( self::uses_plain_permalinks() ) {
			return add_query_arg( 'format', 'markdown', $permalink );
		}

		$path = wp_parse_url( $permalink, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return add_query_arg( 'format', 'markdown', $permalink );
		}

		$normalized_path = self::normalize_path( $path );

		if ( '/' === $normalized_path ) {
			return home_url( '/' . self::MARKDOWN_INDEX_FILENAME );
		}

		return home_url( trailingslashit( $normalized_path ) . self::MARKDOWN_INDEX_FILENAME );
	}

	public static function resolve_post_id_from_request_path( string $request_path ): int {
		$html_path = self::get_html_path_from_markdown_request_path( $request_path );

		if ( null === $html_path ) {
			return 0;
		}

		$post_id = url_to_postid( home_url( $html_path ) );

		return is_numeric( $post_id ) ? (int) $post_id : 0;
	}

	public static function is_markdown_request_path( string $request_path ): bool {
		return null !== self::get_html_path_from_markdown_request_path( $request_path );
	}

	public static function get_html_path_from_markdown_request_path( string $request_path ): ?string {
		$path = self::normalize_path( $request_path );

		if ( '/' . self::MARKDOWN_INDEX_FILENAME === $path ) {
			return '/';
		}

		$suffix = '/' . self::MARKDOWN_INDEX_FILENAME;

		if ( ! str_ends_with( $path, $suffix ) ) {
			return null;
		}

		$html_path = substr( $path, 0, -strlen( $suffix ) );

		if ( '' === $html_path ) {
			return '/';
		}

		return trailingslashit( $html_path );
	}

	public static function get_request_path(): string {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return '/';
		}

		return self::strip_home_path( $path );
	}

	private static function uses_plain_permalinks(): bool {
		return '' === get_option( 'permalink_structure' );
	}

	private static function strip_home_path( string $path ): string {
		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( ! is_string( $home_path ) || '' === $home_path || '/' === $home_path ) {
			return self::normalize_path( $path );
		}

		$home_path = untrailingslashit( $home_path );

		if ( 0 === strpos( $path, $home_path ) ) {
			$path = substr( $path, strlen( $home_path ) );
		}

		return self::normalize_path( $path );
	}

	private static function normalize_path( string $path ): string {
		$path = '/' . ltrim( $path, '/' );

		if ( '/' !== $path ) {
			$path = untrailingslashit( $path );
		}

		return $path;
	}
}

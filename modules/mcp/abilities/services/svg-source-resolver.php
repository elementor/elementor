<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves an e-svg node's (or patch's) source fields to a `svg-src` value envelope.
 *
 * Single source of truth shared by the create path ({@see Element_Spec_Resolver})
 * and the surgical-edit path ({@see \Elementor\Modules\Mcp\Abilities\Post\Element_Mutation_Operation}),
 * so both behave identically: same precedence, same validation, same warnings.
 *
 * Precedence: svg_id (+ aliases) → svg_url (+ aliases) → svg_markup (inline markup,
 * sanitized and sideloaded via {@see Svg_Uploader}). `resolve()` returns the inner
 * value array (`{ id, url }`) or null when nothing usable was produced; warnings
 * explain every fallback so callers can surface them in `warnings[]`.
 */
class Svg_Source_Resolver {

	const DEFAULT_SVG_URL = ELEMENTOR_ASSETS_URL . 'images/default-svg.svg';

	private const ID_ALIASES = [ 'svg_id', 'attachment_id', 'media_id' ];
	private const URL_ALIASES = [ 'svg_url', 'src' ];
	private const MARKUP_ALIASES = [ 'svg_markup', 'svg_content', 'svg_inline' ];

	private bool $dry_run;

	private array $warnings = [];

	public function __construct( bool $dry_run = false ) {
		$this->dry_run = $dry_run;
	}

	public static function make( bool $dry_run = false ): self {
		return new self( $dry_run );
	}

	public function get_warnings(): array {
		return $this->warnings;
	}

	/**
	 * @return array{id: ?array, url: ?array}|null The svg-src value, or null when no
	 *                                             usable source was produced.
	 */
	public function resolve( array $source, string $path = '' ): ?array {
		$seen = [];
		$specific_warning = false;

		foreach ( self::ID_ALIASES as $key ) {
			if ( ! isset( $source[ $key ] ) ) {
				continue;
			}
			$seen[] = $key;
			if ( is_numeric( $source[ $key ] ) && (int) $source[ $key ] > 0 ) {
				$id = (int) $source[ $key ];
				if ( $this->is_valid_svg_attachment( $id ) ) {
					return self::value_from_id( $id );
				}
				$this->warnings[] = [
					'reason' => 'svg_id_invalid_mime',
					'path' => $path,
					'keys' => [ $key ],
					'hint' => sprintf( 'Attachment %d is missing or is not an image/svg+xml file; it was not used. Pass the id of an uploaded .svg, or use svg_url / svg_markup.', $id ),
				];
				$specific_warning = true;
			}
		}

		foreach ( self::URL_ALIASES as $key ) {
			if ( ! isset( $source[ $key ] ) ) {
				continue;
			}
			$seen[] = $key;
			$url = self::sanitize_url( $source[ $key ] );
			if ( null !== $url ) {
				return self::value_from_url( $url );
			}
		}

		foreach ( self::MARKUP_ALIASES as $key ) {
			if ( ! isset( $source[ $key ] ) || ! is_string( $source[ $key ] ) || '' === trim( $source[ $key ] ) ) {
				continue;
			}
			$seen[] = $key;

			if ( $this->dry_run ) {
				$this->warnings[] = [
					'reason' => 'svg_inline_upload_skipped_dry_run',
					'path' => $path,
					'keys' => [ $key ],
					'hint' => 'Inline SVG markup is sideloaded into the media library only on a real save; the default SVG is shown in this dry-run preview. Re-run without dry_run to upload.',
				];
				return null;
			}

			$title = isset( $source['alt'] ) && is_string( $source['alt'] ) ? trim( $source['alt'] ) : '';
			$attachment_id = Svg_Uploader::make()->upload_inline( $source[ $key ], $title );
			if ( null !== $attachment_id ) {
				return self::value_from_id( $attachment_id );
			}

			$this->warnings[] = [
				'reason' => 'svg_inline_upload_failed',
				'path' => $path,
				'keys' => [ $key ],
				'hint' => 'Inline SVG markup could not be sanitized or uploaded (it may contain disallowed content, or the server lacks DOMDocument/SimpleXMLElement); existing source kept. Provide svg_id or svg_url instead.',
			];
			return null;
		}

		if ( ! empty( $seen ) && ! $specific_warning ) {
			$this->warnings[] = [
				'reason' => 'svg_source_unresolved',
				'path' => $path,
				'keys' => array_values( array_unique( $seen ) ),
				'hint' => 'SVG source keys were present but none resolved. Use svg_id (attachment id of an uploaded .svg), svg_url (http/https to an .svg), or svg_markup (inline <svg>…</svg> to upload). Aliases: attachment_id, media_id (for id); src (for url); svg_content, svg_inline (for markup).',
			];
		}

		return null;
	}

	public static function default_value(): array {
		return self::value_from_url( self::DEFAULT_SVG_URL );
	}

	public static function value_from_id( int $attachment_id ): array {
		return [
			'id' => [
				'$$type' => 'image-attachment-id',
				'value' => $attachment_id,
			],
			'url' => null,
		];
	}

	public static function value_from_url( string $url ): array {
		return [
			'id' => null,
			'url' => [
				'$$type' => 'url',
				'value' => $url,
			],
		];
	}

	private function is_valid_svg_attachment( int $attachment_id ): bool {
		$post = get_post( $attachment_id );

		if ( ! $post || 'attachment' !== $post->post_type ) {
			return false;
		}

		return 'image/svg+xml' === get_post_mime_type( $attachment_id );
	}

	private static function sanitize_url( $raw ): ?string {
		if ( ! is_string( $raw ) ) {
			return null;
		}
		$raw = trim( $raw );
		if ( '' === $raw ) {
			return null;
		}
		$sanitized = esc_url_raw( $raw, [ 'http', 'https' ] );
		return '' !== $sanitized ? $sanitized : null;
	}
}

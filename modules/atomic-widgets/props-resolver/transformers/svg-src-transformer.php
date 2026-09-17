<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Core\Utils\Svg\Svg_Sanitizer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Svg_Src_Transformer extends Transformer_Base {
	const SVG_INLINE_STYLES = 'width: 100%; height: 100%; overflow: unset;';

	public function transform( $value, Props_Resolver_Context $context ) {
		$id = isset( $value['id'] ) ? (int) $value['id'] : null;
		$url = $value['url'] ?? null;

		if ( $id ) {
			$resolved_url = wp_get_attachment_url( $id );

			if ( $resolved_url ) {
				$url = $resolved_url;
			}
		}

		$svg_content = $this->fetch_svg_content( $id, $url );
		$html = $svg_content ? $this->process_svg( $svg_content ) : '';

		return [
			'html' => $html,
			'url' => $url,
		];
	}

	private function fetch_svg_content( ?int $id, ?string $url ): ?string {
		if ( $id ) {
			$path = get_attached_file( $id );
			$content = $path ? Utils::file_get_contents( $path ) : null;

			if ( $content ) {
				return $content;
			}
		}

		if ( ! $url ) {
			return null;
		}

		$local_content = $this->fetch_local_svg_content( $url );

		return $local_content ? $local_content : $this->fetch_remote_svg_content( $url );
	}

	private function fetch_local_svg_content( string $url ): ?string {
		$local_path = $this->resolve_local_path( $url );

		if ( ! $local_path ) {
			return null;
		}

		$content = Utils::file_get_contents( $local_path );

		return $content ? $content : null;
	}

	private function fetch_remote_svg_content( string $url ): ?string {
		$response = wp_safe_remote_get( $url );

		if ( is_wp_error( $response ) ) {
			return null;
		}

		if ( \WP_Http::OK !== (int) wp_remote_retrieve_response_code( $response ) ) {
			return null;
		}

		$body = wp_remote_retrieve_body( $response );

		return $body ? $body : null;
	}

	private function resolve_local_path( string $url ): ?string {
		$site_url = site_url();

		if ( 0 !== strpos( $url, $site_url ) ) {
			return null;
		}

		$relative = substr( $url, strlen( $site_url ) );
		$path = ABSPATH . ltrim( $relative, '/' );

		return file_exists( $path ) ? $path : null;
	}

	private function process_svg( string $content ): string {
		$svg = new \WP_HTML_Tag_Processor( $content );

		if ( ! $svg->next_tag( 'svg' ) ) {
			return '';
		}

		$svg->set_attribute( 'fill', 'currentColor' );
		$this->merge_inline_styles( $svg );

		return ( new Svg_Sanitizer() )->sanitize( $svg->get_updated_html() );
	}

	private function merge_inline_styles( \WP_HTML_Tag_Processor $svg ): void {
		$existing = trim( (string) $svg->get_attribute( 'style' ) );

		$merged = empty( $existing )
			? self::SVG_INLINE_STYLES
			: rtrim( $existing, ';' ) . '; ' . self::SVG_INLINE_STYLES;

		$svg->set_attribute( 'style', $merged );
	}
}

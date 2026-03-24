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

		$local_content = $this->try_local_asset_read( $url );

		if ( $local_content ) {
			return $local_content;
		}

		$response = wp_safe_remote_get( $url );

		if ( ! is_wp_error( $response ) ) {
			return $response['body'];
		}

		return null;
	}

	private function try_local_asset_read( string $url ): ?string {
		if ( ! defined( 'ELEMENTOR_ASSETS_URL' ) || ! defined( 'ELEMENTOR_ASSETS_PATH' ) ) {
			return null;
		}

		if ( 0 !== strpos( $url, ELEMENTOR_ASSETS_URL ) ) {
			return null;
		}

		$relative = substr( $url, strlen( ELEMENTOR_ASSETS_URL ) );
		$content = Utils::file_get_contents( ELEMENTOR_ASSETS_PATH . $relative );

		return $content ?: null;
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

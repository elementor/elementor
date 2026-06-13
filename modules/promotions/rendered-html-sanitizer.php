<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rendered_Html_Sanitizer {

	private const DOCUMENT_NOISE_PATTERNS = [
		'/<head\b[^>]*>.*?<\/head>/is',
		'/<script\b[^>]*>.*?<\/script>/is',
		'/<link\b[^>]*>/is',
		'/<meta\b[^>]*>/is',
		'/<title\b[^>]*>.*?<\/title>/is',
		'/<noscript\b[^>]*>.*?<\/noscript>/is',
	];

	public static function sanitize( string $html ): string {
		if ( '' === trim( $html ) ) {
			return '';
		}

		$head_styles = self::extract_head_style_blocks( $html );
		$html = self::extract_body_content( $html );

		foreach ( self::DOCUMENT_NOISE_PATTERNS as $pattern ) {
			$html = preg_replace( $pattern, '', $html );
		}

		return trim( $head_styles . $html );
	}

	public static function sanitize_for_display( string $html ): string {
		return wp_kses( self::sanitize( $html ), self::get_display_allowed_html() );
	}

	public static function get_display_allowed_html(): array {
		$allowed = wp_kses_allowed_html( 'post' );
		$allowed['style'] = [
			'type' => true,
			'media' => true,
			'id' => true,
			'class' => true,
		];
		$allowed['svg'] = [
			'class' => true,
			'aria-hidden' => true,
			'aria-label' => true,
			'role' => true,
			'xmlns' => true,
			'width' => true,
			'height' => true,
			'viewbox' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'focusable' => true,
		];
		$allowed['path'] = [
			'd' => true,
			'fill' => true,
			'stroke' => true,
			'stroke-width' => true,
			'stroke-linecap' => true,
			'stroke-linejoin' => true,
		];
		$allowed['main'] = [
			'id' => true,
			'class' => true,
		];
		$allowed['figure'] = [
			'class' => true,
		];
		$allowed['form'] = [
			'class' => true,
			'method' => true,
			'name' => true,
			'aria-label' => true,
		];
		$allowed['input'] = [
			'type' => true,
			'name' => true,
			'id' => true,
			'class' => true,
			'value' => true,
			'placeholder' => true,
			'size' => true,
		];
		$allowed['textarea'] = [
			'name' => true,
			'id' => true,
			'class' => true,
			'rows' => true,
			'placeholder' => true,
		];
		$allowed['select'] = [
			'name' => true,
			'id' => true,
			'class' => true,
		];
		$allowed['option'] = [
			'value' => true,
			'selected' => true,
		];
		$allowed['button'] = [
			'type' => true,
			'class' => true,
		];
		$allowed['label'] = [
			'for' => true,
			'class' => true,
		];

		foreach ( [ 'div', 'section', 'article', 'header', 'footer', 'nav', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img' ] as $tag ) {
			if ( ! isset( $allowed[ $tag ] ) ) {
				$allowed[ $tag ] = [];
			}

			$allowed[ $tag ] = array_merge(
				$allowed[ $tag ],
				[
					'class' => true,
					'id' => true,
					'style' => true,
					'role' => true,
					'aria-label' => true,
					'aria-roledescription' => true,
					'aria-live' => true,
					'dir' => true,
					'data-id' => true,
					'data-element_type' => true,
					'data-e-type' => true,
					'data-widget_type' => true,
					'data-settings' => true,
					'data-slide' => true,
					'data-elementor-type' => true,
					'data-elementor-id' => true,
					'data-elementor-post-type' => true,
					'href' => true,
					'target' => true,
					'rel' => true,
					'src' => true,
					'alt' => true,
					'width' => true,
					'height' => true,
					'loading' => true,
					'decoding' => true,
					'fetchpriority' => true,
				]
			);
		}

		return $allowed;
	}

	private static function extract_head_style_blocks( string $html ): string {
		if ( ! preg_match( '/<head\b[^>]*>(.*?)<\/head>/is', $html, $matches ) ) {
			return '';
		}

		if ( ! preg_match_all( '/<style\b[^>]*>.*?<\/style>/is', $matches[1], $style_matches ) ) {
			return '';
		}

		return implode( '', $style_matches[0] );
	}

	private static function extract_body_content( string $html ): string {
		if ( preg_match( '/<body\b[^>]*>(.*)<\/body>/is', $html, $matches ) ) {
			return $matches[1];
		}

		return $html;
	}
}

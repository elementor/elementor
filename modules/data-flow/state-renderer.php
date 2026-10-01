<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\AtomicWidgets\Elements\TemplateRenderer\Template_Renderer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Renderer {
	const BINDING_PATTERN = '/\{\{\s*state\.([\w.]+)\s*\}\}/';
	const VALUE_TEMPLATE = 'elementor/data-flow/state-value';
	const RAW_TEXT_TAGS = [ 'script', 'style', 'textarea' ];

	public static function has_bindings( string $html ): bool {
		return 1 === preg_match( self::BINDING_PATTERN, $html );
	}

	/**
	 * Bindings are returned in document order as { template, text } pairs, where `text` is the decoded
	 * text node content the browser will see, so the client can locate the node without extra markup.
	 *
	 * @return array{html: string, bindings: array<int, array{template: string, text: string}>}
	 */
	public static function render( string $html, array $state ): array {
		$bindings = [];

		if ( ! self::has_bindings( $html ) ) {
			return [
				'html' => $html,
				'bindings' => $bindings,
			];
		}

		$chunks = preg_split( '/(<[^>]*>)/', $html, -1, PREG_SPLIT_DELIM_CAPTURE );
		$raw_text_tag = null;

		foreach ( $chunks as $index => $chunk ) {
			if ( self::is_tag( $chunk ) ) {
				$raw_text_tag = self::get_raw_text_tag( $chunk, $raw_text_tag );
				continue;
			}

			if ( null !== $raw_text_tag || ! self::has_bindings( $chunk ) ) {
				continue;
			}

			$chunks[ $index ] = self::render_text( $chunk, $state );

			$bindings[] = [
				'template' => self::decode( $chunk ),
				'text' => self::decode( $chunks[ $index ] ),
			];
		}

		return [
			'html' => implode( '', $chunks ),
			'bindings' => $bindings,
		];
	}

	private static function render_text( string $text, array $state ): string {
		$renderer = self::get_renderer();

		return preg_replace_callback(
			self::BINDING_PATTERN,
			fn( $binding ) => $renderer->render( self::VALUE_TEMPLATE, [
				'state' => $state,
				'path' => $binding[1],
			] ),
			$text
		);
	}

	private static function get_renderer(): Template_Renderer {
		$renderer = Template_Renderer::instance();

		if ( ! $renderer->is_registered( self::VALUE_TEMPLATE ) ) {
			$renderer->register( self::VALUE_TEMPLATE, __DIR__ . '/templates/state-value.html.twig' );
		}

		return $renderer;
	}

	private static function decode( string $html_text ): string {
		return html_entity_decode( $html_text, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	private static function is_tag( string $chunk ): bool {
		return '' !== $chunk && '<' === $chunk[0];
	}

	private static function get_raw_text_tag( string $tag, ?string $current_raw_text_tag ): ?string {
		if ( null !== $current_raw_text_tag ) {
			$is_closing_tag = 1 === preg_match( '/^<\/' . $current_raw_text_tag . '\b/i', $tag );

			return $is_closing_tag ? null : $current_raw_text_tag;
		}

		if ( preg_match( '/^<(' . implode( '|', self::RAW_TEXT_TAGS ) . ')\b/i', $tag, $match ) ) {
			return strtolower( $match[1] );
		}

		return null;
	}
}

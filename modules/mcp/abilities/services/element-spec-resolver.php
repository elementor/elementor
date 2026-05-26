<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Friendly node JSON → v4 element tree.
 *
 * Accepts { widget, text, tag, url, target_blank, css, classes, children } and
 * produces the verbose v4 shape (elType, widgetType, settings.* with $$type
 * envelopes) downstream pipelines expect. Per-node `css` is passed through
 * unchanged; `Element_Css_Transformer` handles it after this resolver runs.
 *
 * Nodes already in raw v4 form (presence of `elType`) are passed through
 * recursively, so agents can mix the two shapes within one tree.
 */
class Element_Spec_Resolver {

	private const WIDGET_SYNONYMS = [
		'container' => 'e-div-block',
		'section' => 'e-div-block',
		'div' => 'e-div-block',
		'div-block' => 'e-div-block',
		'e-div-block' => 'e-div-block',
		'flex' => 'e-flexbox',
		'flexbox' => 'e-flexbox',
		'e-flexbox' => 'e-flexbox',
		'heading' => 'e-heading',
		'paragraph' => 'e-paragraph',
		'p' => 'e-paragraph',
		'text' => 'e-paragraph',
		'label' => 'e-paragraph',
		'button' => 'e-button',
	];

	private const CONTAINER_TYPES = [ 'e-flexbox', 'e-div-block' ];

	private const ALLOWED_URL_SCHEMES = [ 'http', 'https', 'mailto', 'tel' ];

	public static function make(): self {
		return new self();
	}

	public function resolve( array $elements ): array {
		$resolved = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}
			$resolved[] = $this->resolve_node( $element );
		}

		return $resolved;
	}

	private function resolve_node( array $node ): array {
		if ( isset( $node['elType'] ) ) {
			if ( isset( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$node['elements'] = $this->resolve( $node['elements'] );
			}
			return $node;
		}

		if ( ! isset( $node['widget'] ) || ! is_string( $node['widget'] ) ) {
			return $node;
		}

		$widget_alias = strtolower( trim( $node['widget'] ) );
		$widget_type = self::WIDGET_SYNONYMS[ $widget_alias ] ?? null;

		if ( null === $widget_type ) {
			return $node;
		}

		$is_container = in_array( $widget_type, self::CONTAINER_TYPES, true );

		$built = [
			'elType' => $is_container ? $widget_type : 'widget',
		];

		if ( ! $is_container ) {
			$built['widgetType'] = $widget_type;
		}

		$built['settings'] = [];

		if ( ! $is_container ) {
			$this->apply_widget_settings( $widget_type, $node, $built );
		}

		if ( isset( $node['classes'] ) && is_array( $node['classes'] ) ) {
			$classes = array_values( array_filter( $node['classes'], 'is_string' ) );
			if ( ! empty( $classes ) ) {
				$built['settings']['classes'] = [
					'$$type' => 'classes',
					'value' => $classes,
				];
			}
		}

		if ( isset( $node['css'] ) && is_string( $node['css'] ) ) {
			$built['css'] = $node['css'];
		}

		if ( $is_container && isset( $node['children'] ) && is_array( $node['children'] ) ) {
			$built['elements'] = $this->resolve( $node['children'] );
		}

		return $built;
	}

	private function apply_widget_settings( string $widget_type, array $node, array &$built ): void {
		$text = isset( $node['text'] ) && is_string( $node['text'] ) ? $node['text'] : '';

		switch ( $widget_type ) {
			case 'e-heading':
				if ( '' !== $text ) {
					$built['settings']['title'] = $this->html_v3( $text );
				}
				$built['settings']['tag'] = [
					'$$type' => 'string',
					'value' => $this->normalize_heading_tag( $node['tag'] ?? null ),
				];
				break;

			case 'e-paragraph':
				if ( '' !== $text ) {
					$built['settings']['paragraph'] = $this->html_v3( $text );
				}
				if ( isset( $node['tag'] ) && is_string( $node['tag'] ) && '' !== $node['tag'] ) {
					$built['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $node['tag'],
					];
				}
				break;

			case 'e-button':
				if ( '' !== $text ) {
					$built['settings']['text'] = $this->html_v3( $text );
				}
				$url = $this->sanitize_button_url( $node['url'] ?? null );
				if ( null !== $url ) {
					$built['settings']['link'] = [
						'$$type' => 'link',
						'value' => [
							'destination' => [
								'$$type' => 'url',
								'value' => $url,
							],
							'isTargetBlank' => [
								'$$type' => 'boolean',
								'value' => ! empty( $node['target_blank'] ),
							],
						],
					];
				}
				if ( isset( $node['tag'] ) && is_string( $node['tag'] ) && '' !== $node['tag'] ) {
					$built['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $node['tag'],
					];
				}
				break;
		}
	}

	private function html_v3( string $text ): array {
		return [
			'$$type' => 'html-v3',
			'value' => [
				'content' => [
					'$$type' => 'string',
					'value' => $text,
				],
				'children' => [],
			],
		];
	}

	private function normalize_heading_tag( $tag ): string {
		if ( is_string( $tag ) && preg_match( '/^h[1-6]$/i', $tag ) ) {
			return strtolower( $tag );
		}
		return 'h2';
	}

	/**
	 * Sanitize a button destination URL.
	 *
	 * Accepts absolute URLs with allowed schemes, scheme-relative `//host`, root-relative
	 * `/path`, and fragment-only anchors `#anchor`. Rejects everything else (including
	 * `javascript:`, `data:`, `vbscript:`, `file:`).
	 *
	 * @return string|null sanitized URL, or null if input is invalid / empty.
	 */
	private function sanitize_button_url( $raw ): ?string {
		if ( ! is_string( $raw ) ) {
			return null;
		}

		$raw = trim( $raw );
		if ( '' === $raw ) {
			return null;
		}

		if ( str_starts_with( $raw, '#' ) || str_starts_with( $raw, '/' ) ) {
			$sanitized = esc_url_raw( $raw );
			return '' !== $sanitized ? $sanitized : null;
		}

		$sanitized = esc_url_raw( $raw, self::ALLOWED_URL_SCHEMES );

		return '' !== $sanitized ? $sanitized : null;
	}
}

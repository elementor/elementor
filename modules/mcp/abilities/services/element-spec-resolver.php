<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Utils;

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
		'e-heading' => 'e-heading',
		'paragraph' => 'e-paragraph',
		'e-paragraph' => 'e-paragraph',
		'p' => 'e-paragraph',
		'text' => 'e-paragraph',
		'label' => 'e-paragraph',
		'button' => 'e-button',
		'e-button' => 'e-button',
		'image' => 'e-image',
		'img' => 'e-image',
		'e-image' => 'e-image',
	];

	private const CONTAINER_TYPES = [ 'e-flexbox', 'e-div-block' ];

	private const ALLOWED_URL_SCHEMES = [ 'http', 'https', 'mailto', 'tel' ];

	private array $unresolved = [];

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

	public function get_unresolved(): array {
		return $this->unresolved;
	}

	private function resolve_node( array $node ): array {
		if ( isset( $node['elType'] ) ) {
			if ( empty( $node['id'] ) || ! is_string( $node['id'] ) ) {
				$node['id'] = Utils::generate_random_string();
			}
			if ( isset( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$node['elements'] = $this->resolve( $node['elements'] );
			}
			return $node;
		}

		if ( ! isset( $node['widget'] ) || ! is_string( $node['widget'] ) ) {
			$this->unresolved[] = [
				'reason' => 'missing_widget',
				'received_keys' => array_keys( $node ),
			];
			return $node;
		}

		$widget_alias = strtolower( trim( $node['widget'] ) );
		$widget_type = self::WIDGET_SYNONYMS[ $widget_alias ] ?? null;

		if ( null === $widget_type ) {
			$this->unresolved[] = [
				'reason' => 'unknown_widget',
				'widget' => $node['widget'],
				'supported' => array_values( array_unique( array_values( self::WIDGET_SYNONYMS ) ) ),
			];
			return $node;
		}

		$is_container = in_array( $widget_type, self::CONTAINER_TYPES, true );

		$built = [
			'id' => isset( $node['id'] ) && is_string( $node['id'] ) && '' !== $node['id'] ? $node['id'] : Utils::generate_random_string(),
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

		$css = self::normalize_css( $node['css'] ?? null );
		if ( null !== $css ) {
			$built['css'] = $css;
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
					$built['settings']['title'] = self::html_v3_envelope( $text );
				}
				$built['settings']['tag'] = [
					'$$type' => 'string',
					'value' => self::normalize_heading_tag( $node['tag'] ?? null ),
				];
				break;

			case 'e-paragraph':
				if ( '' !== $text ) {
					$built['settings']['paragraph'] = self::html_v3_envelope( $text );
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
					$built['settings']['text'] = self::html_v3_envelope( $text );
				}
				$url = self::sanitize_button_url( $node['url'] ?? null );
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

			case 'e-image':
				$image_src = $this->build_image_src( $node );
				if ( null !== $image_src ) {
					$built['settings']['image'] = [
						'$$type' => 'image',
						'value' => [
							'src' => [
								'$$type' => 'image-src',
								'value' => $image_src,
							],
							'size' => [
								'$$type' => 'string',
								'value' => self::normalize_image_size( $node['size'] ?? null ),
							],
						],
					];
				} else {
					$this->unresolved[] = [
						'reason' => 'missing_image_source',
						'widget' => 'e-image',
						'expected' => 'image_id (int) or image_url (http/https)',
					];
				}

				$link_url = self::sanitize_button_url( $node['url'] ?? null );
				if ( null !== $link_url ) {
					$built['settings']['link'] = [
						'$$type' => 'link',
						'value' => [
							'destination' => [
								'$$type' => 'url',
								'value' => $link_url,
							],
							'isTargetBlank' => [
								'$$type' => 'boolean',
								'value' => ! empty( $node['target_blank'] ),
							],
						],
					];
				}
				break;
		}
	}

	private function build_image_src( array $node ): ?array {
		$alt_raw = isset( $node['alt'] ) && is_string( $node['alt'] ) ? trim( $node['alt'] ) : '';
		$alt_envelope = '' !== $alt_raw
			? [ '$$type' => 'string', 'value' => $alt_raw ]
			: null;

		if ( isset( $node['image_id'] ) && is_numeric( $node['image_id'] ) && (int) $node['image_id'] > 0 ) {
			return [
				'id' => [
					'$$type' => 'image-attachment-id',
					'value' => (int) $node['image_id'],
				],
				'url' => null,
				'alt' => $alt_envelope,
			];
		}

		if ( isset( $node['image_url'] ) && is_string( $node['image_url'] ) ) {
			$raw = trim( $node['image_url'] );
			if ( '' !== $raw ) {
				$sanitized = esc_url_raw( $raw, [ 'http', 'https' ] );
				if ( '' !== $sanitized ) {
					return [
						'id' => null,
						'url' => [
							'$$type' => 'url',
							'value' => $sanitized,
						],
						'alt' => $alt_envelope,
					];
				}
			}
		}

		return null;
	}

	private static function normalize_image_size( $raw ): string {
		if ( is_string( $raw ) ) {
			$trimmed = trim( $raw );
			if ( '' !== $trimmed ) {
				return $trimmed;
			}
		}
		return 'full';
	}

	/**
	 * @internal Promoted to public-static for reuse by Element_Mutation_Operation.
	 */
	public static function normalize_css( $raw ): ?string {
		if ( is_string( $raw ) ) {
			$trimmed = trim( $raw );
			return '' !== $trimmed ? $trimmed : null;
		}

		if ( is_array( $raw ) ) {
			$declarations = [];
			foreach ( $raw as $property => $value ) {
				if ( ! is_string( $property ) || '' === trim( $property ) ) {
					continue;
				}
				if ( is_bool( $value ) || null === $value ) {
					continue;
				}
				$declarations[] = trim( $property ) . ': ' . trim( (string) $value );
			}
			return ! empty( $declarations ) ? implode( '; ', $declarations ) : null;
		}

		return null;
	}

	/**
	 * @internal Promoted to public-static for reuse by Element_Mutation_Operation.
	 */
	public static function html_v3_envelope( string $text ): array {
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

	/**
	 * @internal Promoted to public-static for reuse by Element_Mutation_Operation.
	 */
	public static function normalize_heading_tag( $tag ): string {
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
	 * @internal Promoted to public-static for reuse by Element_Mutation_Operation.
	 * @return string|null sanitized URL, or null if input is invalid / empty.
	 */
	public static function sanitize_button_url( $raw ): ?string {
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

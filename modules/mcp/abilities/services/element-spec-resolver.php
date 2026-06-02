<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Utils\Image\Placeholder_Image;
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
		'e-container' => 'e-div-block',
		'section' => 'e-div-block',
		'e-section' => 'e-div-block',
		'div' => 'e-div-block',
		'e-div' => 'e-div-block',
		'div-block' => 'e-div-block',
		'e-div-block' => 'e-div-block',
		'block' => 'e-div-block',
		'e-block' => 'e-div-block',
		'wrapper' => 'e-div-block',
		'group' => 'e-div-block',
		'flex' => 'e-flexbox',
		'e-flex' => 'e-flexbox',
		'flexbox' => 'e-flexbox',
		'e-flexbox' => 'e-flexbox',
		'row' => 'e-flexbox',
		'column' => 'e-flexbox',
		'col' => 'e-flexbox',
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
		'svg' => 'e-svg',
		'e-svg' => 'e-svg',
	];

	private const CONTAINER_TYPES = [ 'e-flexbox', 'e-div-block' ];

	private const ALLOWED_URL_SCHEMES = [ 'http', 'https', 'mailto', 'tel' ];

	private array $unresolved = [];

	private array $warnings = [];

	private bool $dry_run;

	public function __construct( bool $dry_run = false ) {
		$this->dry_run = $dry_run;
	}

	/**
	 * @param bool $dry_run When true, side-effectful resolution (e.g. sideloading
	 *                      inline SVG markup into the media library) is skipped so a
	 *                      dry-run never writes attachments. A warning is emitted in
	 *                      its place.
	 */
	public static function make( bool $dry_run = false ): self {
		return new self( $dry_run );
	}

	public function resolve( array $elements, string $path = 'elements' ): array {
		$resolved = [];

		foreach ( $elements as $index => $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}
			$resolved[] = $this->resolve_node( $element, $path . '[' . $index . ']' );
		}

		return $resolved;
	}

	public function get_unresolved(): array {
		return $this->unresolved;
	}

	public function get_warnings(): array {
		return $this->warnings;
	}

	private function resolve_node( array $node, string $path ): array {
		if ( isset( $node['elType'] ) ) {
			if ( empty( $node['id'] ) || ! is_string( $node['id'] ) ) {
				$node['id'] = Utils::generate_random_string();
			}
			if ( isset( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$node['elements'] = $this->resolve( $node['elements'], $path . '.elements' );
			}
			return $node;
		}

		if ( ! isset( $node['widget'] ) || ! is_string( $node['widget'] ) ) {
			$this->unresolved[] = [
				'reason' => 'missing_widget',
				'path' => $path,
				'received_keys' => array_keys( $node ),
			];
			return $node;
		}

		$widget_alias = strtolower( trim( $node['widget'] ) );
		$widget_type = self::WIDGET_SYNONYMS[ $widget_alias ] ?? null;

		if ( null === $widget_type ) {
			$this->unresolved[] = [
				'reason' => 'unknown_widget',
				'path' => $path,
				'widget' => $node['widget'],
				'supported' => array_values( array_unique( array_values( self::WIDGET_SYNONYMS ) ) ),
			];
			return $node;
		}

		$is_container = in_array( $widget_type, self::CONTAINER_TYPES, true );

		$built = [
			'id' => self::resolve_element_id( $node ),
			'elType' => $is_container ? $widget_type : 'widget',
		];

		if ( ! $is_container ) {
			$built['widgetType'] = $widget_type;
		}

		$built['settings'] = [];

		if ( ! $is_container ) {
			$this->apply_widget_settings( $widget_type, $node, $built, $path );
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

		$states = self::normalize_states( $node['states'] ?? null );
		foreach ( $states['warnings'] as $warning ) {
			$warning['path'] = $path;
			$this->warnings[] = $warning;
		}
		if ( ! empty( $states['states'] ) ) {
			$built['states'] = $states['states'];
		}

		if ( $is_container && isset( $node['children'] ) && is_array( $node['children'] ) ) {
			$built['elements'] = $this->resolve( $node['children'], $path . '.children' );
		}

		return $built;
	}

	/**
	 * Decide the v4 element id. Only a non-empty string `id` is treated as the
	 * element id; a numeric `id` on an image node is consumed by build_image_src()
	 * as an attachment-id alias (see WP-natural alias mapping for e-image).
	 */
	private static function resolve_element_id( array $node ): string {
		if ( isset( $node['id'] ) && is_string( $node['id'] ) && '' !== $node['id'] ) {
			return $node['id'];
		}
		return Utils::generate_random_string();
	}

	private function apply_widget_settings( string $widget_type, array $node, array &$built, string $path ): void {
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
				$this->warn_legacy_link_keys( $node, $path );
				$link = self::build_link( $node );
				if ( null !== $link ) {
					$built['settings']['link'] = $link;
				}
				if ( isset( $node['tag'] ) && is_string( $node['tag'] ) && '' !== $node['tag'] ) {
					$built['settings']['tag'] = [
						'$$type' => 'string',
						'value' => $node['tag'],
					];
				}
				break;

			case 'e-image':
				$built['settings']['image'] = [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => $this->build_image_src( $node, $path ),
						],
						'size' => [
							'$$type' => 'string',
							'value' => self::normalize_image_size( $node['size'] ?? null ),
						],
					],
				];

				$this->warn_legacy_link_keys( $node, $path );
				$link = self::build_link( $node );
				if ( null !== $link ) {
					$built['settings']['link'] = $link;
				}
				break;

			case 'e-svg':
				$built['settings']['svg'] = [
					'$$type' => 'svg-src',
					'value' => $this->resolve_svg_source( $node, $path ),
				];

				$this->warn_legacy_link_keys( $node, $path );
				$link = self::build_link( $node );
				if ( null !== $link ) {
					$built['settings']['link'] = $link;
				}
				break;
		}
	}

	/**
	 * Build a v4 link envelope from friendly node fields.
	 *
	 * Only `link_url` / `link_target_blank` are accepted; legacy `url` /
	 * `target_blank` are ignored on button/image nodes (callers receive a
	 * warnings[] entry from warn_legacy_link_keys() telling them to rename).
	 */
	private static function build_link( array $node ): ?array {
		$url = self::sanitize_button_url( $node['link_url'] ?? null );
		if ( null === $url ) {
			return null;
		}
		return [
			'$$type' => 'link',
			'value' => [
				'destination' => [
					'$$type' => 'url',
					'value' => $url,
				],
				'isTargetBlank' => [
					'$$type' => 'boolean',
					'value' => ! empty( $node['link_target_blank'] ),
				],
			],
		];
	}

	private function warn_legacy_link_keys( array $node, string $path ): void {
		$legacy = [];
		if ( array_key_exists( 'url', $node ) ) {
			$legacy['url'] = 'link_url';
		}
		if ( array_key_exists( 'target_blank', $node ) ) {
			$legacy['target_blank'] = 'link_target_blank';
		}
		if ( empty( $legacy ) ) {
			return;
		}

		$renames = [];
		foreach ( $legacy as $old => $new ) {
			$renames[] = $old . ' → ' . $new;
		}

		$this->warnings[] = [
			'reason' => 'legacy_link_keys_ignored',
			'path' => $path,
			'keys' => array_keys( $legacy ),
			'hint' => 'Rename: ' . implode( ', ', $renames ) . '. The legacy url / target_blank fields are no longer accepted on button, image, or svg nodes; their values were ignored.',
		];
	}

	private const IMAGE_ID_ALIASES = [ 'image_id', 'attachment_id', 'media_id' ];
	private const IMAGE_URL_ALIASES = [ 'image_url', 'src' ];

	private function build_image_src( array $node, string $path ): array {
		$alt_raw = isset( $node['alt'] ) && is_string( $node['alt'] ) ? trim( $node['alt'] ) : '';
		$alt_envelope = '' !== $alt_raw
			? [ '$$type' => 'string', 'value' => $alt_raw ]
			: null;

		$source_keys_seen = [];

		foreach ( self::IMAGE_ID_ALIASES as $key ) {
			if ( ! isset( $node[ $key ] ) ) {
				continue;
			}
			$source_keys_seen[] = $key;
			if ( is_numeric( $node[ $key ] ) && (int) $node[ $key ] > 0 ) {
				return [
					'id' => [
						'$$type' => 'image-attachment-id',
						'value' => (int) $node[ $key ],
					],
					'url' => null,
					'alt' => $alt_envelope,
				];
			}
		}

		if ( isset( $node['id'] ) && is_numeric( $node['id'] ) ) {
			$source_keys_seen[] = 'id';
			if ( (int) $node['id'] > 0 ) {
				return [
					'id' => [
						'$$type' => 'image-attachment-id',
						'value' => (int) $node['id'],
					],
					'url' => null,
					'alt' => $alt_envelope,
				];
			}
		}

		foreach ( self::IMAGE_URL_ALIASES as $key ) {
			if ( ! isset( $node[ $key ] ) ) {
				continue;
			}
			$source_keys_seen[] = $key;
			$url = self::sanitize_image_url( $node[ $key ] );
			if ( null !== $url ) {
				return [
					'id' => null,
					'url' => [
						'$$type' => 'url',
						'value' => $url,
					],
					'alt' => $alt_envelope,
				];
			}
		}

		if ( ! empty( $source_keys_seen ) ) {
			$this->warnings[] = [
				'reason' => 'image_source_unresolved',
				'path' => $path,
				'keys' => array_values( array_unique( $source_keys_seen ) ),
				'hint' => 'Image source keys were present but none resolved to a valid image; Elementor placeholder used. Use image_id (positive integer attachment id) or image_url (http/https). Aliases accepted: attachment_id, media_id, numeric id (for attachment); src (for url).',
			];
		}

		return [
			'id' => null,
			'url' => [
				'$$type' => 'url',
				'value' => Placeholder_Image::get_placeholder_image(),
			],
			'alt' => $alt_envelope,
		];
	}

	/**
	 * Resolve an e-svg node's source to a `svg-src` value envelope.
	 *
	 * Delegates to {@see Svg_Source_Resolver} (shared with the surgical-edit path),
	 * merging its warnings into this resolver's. The prop type requires at least one
	 * of id / url, so an unresolved source falls back to Elementor's default SVG.
	 */
	private function resolve_svg_source( array $node, string $path ): array {
		$svg_resolver = Svg_Source_Resolver::make( $this->dry_run );
		$value = $svg_resolver->resolve( $node, $path );

		foreach ( $svg_resolver->get_warnings() as $warning ) {
			$this->warnings[] = $warning;
		}

		return $value ?? Svg_Source_Resolver::default_value();
	}

	private static function sanitize_image_url( $raw ): ?string {
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
	 * Normalize a friendly `states` map (pseudo-state name → CSS) into a canonical
	 * map keyed by the state value the variant `meta.state` expects.
	 *
	 * Each value accepts the same shapes as `css` (declaration string OR property map)
	 * and is run through {@see self::normalize_css()}. Keys are canonicalized
	 * (lower-cased/trimmed; the friendly alias `selected` maps to the class-state
	 * `e--selected`) and validated against {@see Style_States::is_valid_state()}.
	 * `null` is rejected as a key — the base (state-less) styling is the `css` field.
	 *
	 * @return array{states: array<string, string>, warnings: array<int, array>} Canonical
	 *               state→css map plus any soft warnings for unsupported state keys.
	 */
	public static function normalize_states( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return [ 'states' => [], 'warnings' => [] ];
		}

		$states = [];
		$invalid_keys = [];

		foreach ( $raw as $state_key => $value ) {
			if ( ! is_string( $state_key ) ) {
				$invalid_keys[] = $state_key;
				continue;
			}

			$state = strtolower( trim( $state_key ) );

			if ( 'selected' === $state ) {
				$state = Style_States::SELECTED;
			}

			if ( '' === $state || ! Style_States::is_valid_state( $state ) ) {
				$invalid_keys[] = $state_key;
				continue;
			}

			$css = self::normalize_css( $value );
			if ( null === $css ) {
				continue;
			}

			$states[ $state ] = $css;
		}

		$warnings = [];
		if ( ! empty( $invalid_keys ) ) {
			$warnings[] = [
				'reason' => 'invalid_state',
				'keys' => array_values( array_unique( array_filter( $invalid_keys, 'is_string' ) ) ),
				'hint' => 'Unsupported pseudo-state key(s) ignored. Supported: hover, active, focus, focus-visible, checked, selected.',
			];
		}

		return [
			'states' => $states,
			'warnings' => $warnings,
		];
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

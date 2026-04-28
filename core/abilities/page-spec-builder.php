<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared friendly-spec → Elementor v4 element-node logic.
 *
 * Used by Make_Page_Ability and Edit_Page_Ability. Includes Css_Shorthand_Parser
 * and Base_Styles_Reset so consumers only need `use Page_Spec_Builder;`.
 */
trait Page_Spec_Builder {

	use Css_Shorthand_Parser;
	use Base_Styles_Reset;

	private const CONTAINER_SYNONYMS = [
		'container'   => 'e-flexbox',
		'flexbox'     => 'e-flexbox',
		'e-flexbox'   => 'e-flexbox',
		'section'     => 'e-flexbox',
		'div'         => 'e-div-block',
		'div-block'   => 'e-div-block',
		'e-div-block' => 'e-div-block',
	];

	private const LEAF_WIDGETS = [
		'heading'   => 'e-heading',
		'paragraph' => 'e-paragraph',
		'button'    => 'e-button',
		'image'     => 'e-image',
	];

	private const HEADING_TAGS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

	protected function validate_spec( $node, string $path, array &$errors ): void {
		if ( ! is_array( $node ) ) {
			$errors[] = "$path: expected an object, got " . gettype( $node );
			return;
		}

		if ( isset( $node['widget_type'] ) ) {
			$errors[] = "$path: use `widget`, not `widget_type`. Example: {\"widget\":\"heading\",\"text\":\"Hello\"}.";
		}

		if ( isset( $node['content'] ) && ! isset( $node['children'] ) ) {
			$errors[] = "$path: use `text`, not `content`, on leaf widgets.";
		}

		$widget   = $node['widget'] ?? null;
		$children = $node['children'] ?? null;

		$is_container = is_string( $widget ) && isset( self::CONTAINER_SYNONYMS[ strtolower( $widget ) ] );
		$is_leaf      = is_string( $widget ) && isset( self::LEAF_WIDGETS[ strtolower( $widget ) ] );

		if ( null === $widget && null === $children ) {
			$errors[] = "$path: node must have either `widget` or `children` — got neither.";
		}

		if ( null !== $widget && ! $is_container && ! $is_leaf ) {
			$suggestion = $this->did_you_mean( (string) $widget, array_merge( array_keys( self::CONTAINER_SYNONYMS ), array_keys( self::LEAF_WIDGETS ) ) );
			$hint       = null !== $suggestion ? " Did you mean `$suggestion`?" : '';
			$errors[]   = "$path: unknown widget `$widget`.$hint Valid: " . implode( ', ', array_merge( array_keys( self::CONTAINER_SYNONYMS ), array_keys( self::LEAF_WIDGETS ) ) ) . '.';
		}

		if ( isset( $node['id'] ) && ( ! is_string( $node['id'] ) || 1 !== preg_match( '/^[0-9a-f]{7}$/', $node['id'] ) ) ) {
			$id_val   = is_string( $node['id'] ) ? $node['id'] : wp_json_encode( $node['id'] );
			$errors[] = "$path.id: `id` is the internal widget ID and must be a 7-hex string (got `$id_val`). To set the HTML id attribute for CSS selectors and anchors, use `css_id` instead — e.g. {\"css_id\":\"nav0001\"}.";
		}

		if ( $is_leaf && 'heading' === strtolower( (string) $widget ) && isset( $node['tag'] ) ) {
			$tag = strtolower( (string) $node['tag'] );
			if ( ! in_array( $tag, self::HEADING_TAGS, true ) ) {
				$errors[] = "$path.tag: expected one of [" . implode( ', ', self::HEADING_TAGS ) . "], got `{$node['tag']}`.";
			}
		}

		if ( is_array( $children ) ) {
			foreach ( $children as $i => $child ) {
				$this->validate_spec( $child, "$path.children[$i]", $errors );
			}
		}
	}

	protected function did_you_mean( string $input, array $candidates ): ?string {
		$best      = null;
		$best_dist = PHP_INT_MAX;
		$lower     = strtolower( $input );
		foreach ( $candidates as $cand ) {
			$d = levenshtein( $lower, strtolower( $cand ) );
			if ( $d < $best_dist ) {
				$best_dist = $d;
				$best      = $cand;
			}
		}
		if ( null !== $best && $best_dist <= max( 2, (int) floor( strlen( $input ) / 3 ) ) ) {
			return $best;
		}
		return null;
	}

	protected function build_element( array $spec ): array {
		$id       = isset( $spec['id'] ) && is_string( $spec['id'] ) && '' !== $spec['id'] ? $spec['id'] : Utils::generate_id();
		$widget   = isset( $spec['widget'] ) && is_string( $spec['widget'] ) ? strtolower( $spec['widget'] ) : null;
		$css      = isset( $spec['css'] ) && is_string( $spec['css'] ) ? trim( $spec['css'] ) : '';
		$classes  = isset( $spec['classes'] ) && is_array( $spec['classes'] ) ? array_values( array_filter( $spec['classes'], 'is_string' ) ) : [];
		$children = isset( $spec['children'] ) && is_array( $spec['children'] ) ? $spec['children'] : null;
		$css_id   = isset( $spec['css_id'] ) && is_string( $spec['css_id'] ) && '' !== $spec['css_id'] ? $spec['css_id'] : null;

		$settings = [];
		if ( null !== $css_id ) {
			$settings['_cssid'] = [
				'$$type' => 'string',
				'value'  => $css_id,
			];
		}
		$styles = [];

		$el_type = null !== $widget && isset( self::CONTAINER_SYNONYMS[ $widget ] )
			? self::CONTAINER_SYNONYMS[ $widget ]
			: ( null === $widget && is_array( $children )
				? 'e-flexbox'
				: ( self::LEAF_WIDGETS[ $widget ] ?? 'e-paragraph' ) );

		$user_props   = '' !== $css ? $this->css_to_props( $css ) : [];
		$merged_props = $this->merge_base_style_resets( $user_props, $el_type );

		if ( ! empty( $merged_props ) ) {
			$style_id            = 'e-' . $id . '-s';
			$styles[ $style_id ] = [
				'id'       => $style_id,
				'type'     => 'class',
				'label'    => 'local',
				'variants' => [
					[
						'meta'  => [
							'breakpoint' => 'desktop',
							'state'      => null,
						],
						'props' => $merged_props,
					],
				],
			];
			array_unshift( $classes, $style_id );
		}

		if ( ! empty( $classes ) ) {
			$settings['classes'] = [
				'$$type' => 'classes',
				'value'  => array_values( array_unique( $classes ) ),
			];
		}

		if ( null !== $widget && isset( self::CONTAINER_SYNONYMS[ $widget ] ) ) {
			$child_nodes = [];
			if ( is_array( $children ) ) {
				foreach ( $children as $c ) {
					if ( is_array( $c ) ) {
						$child_nodes[] = $this->build_element( $c );
					}
				}
			}
			$node = [
				'id'       => $id,
				'elType'   => $el_type,
				'settings' => $settings,
				'elements' => $child_nodes,
			];
			if ( ! empty( $styles ) ) {
				$node['styles'] = $styles;
			}
			return $node;
		}

		if ( null === $widget && is_array( $children ) ) {
			$child_nodes = [];
			foreach ( $children as $c ) {
				if ( is_array( $c ) ) {
					$child_nodes[] = $this->build_element( $c );
				}
			}
			$node = [
				'id'       => $id,
				'elType'   => 'e-flexbox',
				'settings' => $settings,
				'elements' => $child_nodes,
			];
			if ( ! empty( $styles ) ) {
				$node['styles'] = $styles;
			}
			return $node;
		}

		$widget_type = self::LEAF_WIDGETS[ $widget ] ?? null;
		if ( null === $widget_type ) {
			$widget_type = 'e-paragraph';
		}

		$this->apply_leaf_settings( $widget, $widget_type, $spec, $settings );

		$node = [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => $widget_type,
			'settings'   => $settings,
		];
		if ( ! empty( $styles ) ) {
			$node['styles'] = $styles;
		}
		return $node;
	}

	private function apply_leaf_settings( string $widget, string $widget_type, array $spec, array &$settings ): void {
		$text = isset( $spec['text'] ) && is_string( $spec['text'] ) ? $spec['text'] : null;
		$tag  = isset( $spec['tag'] ) && is_string( $spec['tag'] ) ? strtolower( $spec['tag'] ) : null;

		if ( 'heading' === $widget ) {
			$settings['title'] = $this->make_html_v3( $text ?? 'Heading' );
			$settings['tag']   = [
				'$$type' => 'string',
				'value'  => null !== $tag ? $tag : 'h2',
			];
			return;
		}

		if ( 'paragraph' === $widget ) {
			$settings['paragraph'] = $this->make_html_v3( $text ?? 'Paragraph' );
			return;
		}

		if ( 'button' === $widget ) {
			$settings['text'] = $this->make_html_v3( $text ?? 'Button' );
			$settings['tag']  = [
				'$$type' => 'string',
				'value'  => null !== $tag ? $tag : 'a',
			];
			if ( isset( $spec['url'] ) && is_string( $spec['url'] ) && '' !== $spec['url'] ) {
				$settings['link'] = [
					'$$type' => 'link',
					'value'  => [
						'href' => [
							'$$type' => 'url',
							'value'  => $spec['url'],
						],
					],
				];
			}
			return;
		}

		if ( 'image' === $widget ) {
			$attachment_id = isset( $spec['attachment_id'] ) && is_numeric( $spec['attachment_id'] ) ? (int) $spec['attachment_id'] : null;
			$url           = isset( $spec['url'] ) && is_string( $spec['url'] ) && '' !== $spec['url'] ? $spec['url'] : null;
			$alt           = isset( $spec['text'] ) && is_string( $spec['text'] ) ? $spec['text'] : '';

			$id_value  = null === $attachment_id ? null : [
				'$$type' => 'image-attachment-id',
				'value'  => $attachment_id,
			];
			$url_value = null === $url ? null : [
				'$$type' => 'url',
				'value'  => $url,
			];

			$settings['image'] = [
				'$$type' => 'image',
				'value'  => [
					'src'  => [
						'$$type' => 'image-src',
						'value'  => [
							'id'  => $id_value,
							'url' => $url_value,
						],
					],
					'size' => [
						'$$type' => 'string',
						'value'  => 'full',
					],
					'alt'  => [
						'$$type' => 'string',
						'value'  => $alt,
					],
				],
			];
		}
	}

	private function make_html_v3( string $text ): array {
		return [
			'$$type' => 'html-v3',
			'value'  => [
				'content'  => [
					'$$type' => 'string',
					'value'  => $text,
				],
				'children' => [],
			],
		];
	}
}

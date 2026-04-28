<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * One-shot page builder from a friendly spec.
 *
 * Accepts a recursive spec tree of containers and leaf widgets (`{widget, children, text, css, ...}`),
 * builds the full Elementor v4 element tree — inline CSS converted to local styles via
 * Css_Shorthand_Parser — and delegates save to Build_Page_Ability so the normalize / validate
 * pipeline runs once. Removes the need to hand-roll $$type nesting across a whole page.
 */
class Make_Page_Ability extends Abstract_Ability {

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

	protected function get_name(): string {
		return 'elementor/make-page';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor Make Page',
			'description'  => 'One-shot page builder from a friendly spec. Recursively builds an Elementor v4 tree (containers + leaf widgets + inline CSS as local styles) and delegates save to build-page. Removes the need to hand-roll $$type payloads across a whole page.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [
					'post_id'     => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to save into. Omit to create a new post (requires title).',
					],
					'title'       => [
						'type'        => 'string',
						'description' => 'Post title. Required when post_id is omitted — creates a new Elementor page and builds it in one call.',
					],
					'post_type'   => [
						'type'        => 'string',
						'description' => 'Post type slug when creating a new post. Default: "page".',
					],
					'post_status' => [
						'type'        => 'string',
						'description' => 'Post status when creating a new post. Default: "draft". Common: draft | publish | private.',
					],
					'slug'        => [
						'type'        => 'string',
						'description' => 'Post slug when creating a new post. WordPress sanitizes and de-duplicates automatically.',
					],
					'sections'    => [
						'type'        => 'array',
						'description' => 'Top-level nodes. Each node is {widget, id?, css?, classes?, children?, text?, tag?, url?, attachment_id?}. Containers have children[]; leaves have text / tag / url / attachment_id as applicable.',
					],
					'dry_run'     => [
						'type'        => 'boolean',
						'description' => 'When true, builds and validates the tree without saving. Returns { success, dry_run:true, elements, errors[] }.',
					],
				],
				'required'             => [ 'sections' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success'   => [ 'type' => 'boolean' ],
					'post_id'   => [ 'type' => 'integer' ],
					'edit_url'  => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'dry_run'   => [ 'type' => 'boolean' ],
					'elements'  => [ 'type' => 'array' ],
					'errors'    => [ 'type' => 'array' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Friendly spec → full Elementor v4 tree → save, in a single call. Delegates save to elementor/build-page so every normalize / auto-mirror / validate pass runs once on the built tree.',
						'POST CREATION: omit post_id and pass title (+ optional post_type/post_status/slug) to create a new WordPress post and build it in one call. Returns edit_url and permalink alongside the build result. For standalone post creation without content use wordpress/create-post.',
						'SPEC SHAPE — each node is { widget, id?, css?, classes?, children?, text?, tag?, url?, attachment_id? }.',
						'CONTAINER synonyms for `widget`: "container"|"flexbox"|"e-flexbox"|"section" → e-flexbox; "div"|"div-block"|"e-div-block" → e-div-block. Containers have children[].',
						'LEAF widgets for `widget`: "heading" → e-heading; "paragraph" → e-paragraph; "button" → e-button; "image" → e-image. Leaves have text/tag/url/attachment_id as applicable.',
						'css: CSS declaration string. Converted via elementor/css-to-props and attached as a local style entry on that node. The auto-generated style id is mirrored into settings.classes.value.',
						'classes: array of global class IDs or labels. Resolved by build-page (label → ID).',
						'id: optional 7-hex element ID. Auto-generated when omitted.',
						'DRY_RUN: pass dry_run:true to build + validate without saving. Returns { success, dry_run:true, elements, errors[] }. Errors are aggregated across structural / widget-settings / style-prop validation.',
						'COMMON MISTAKES that produce actionable errors:',
						'  - widget_type: use `widget`, not `widget_type`.',
						'  - content: use `text`, not `content`, on leaf widgets.',
						'  - unknown widget name: did-you-mean suggestion via Levenshtein.',
						'  - malformed id (not 7-hex): explicit error, lists the bad id.',
						'  - heading with non h1-h6 tag: explicit enum error.',
						'VAR() LABELS: css values like var(--brand) emit label form (global-color-variable / global-size-variable). Label → ID resolution for element styles is not yet wired — if a variable label is not a valid ID, the save will fail validation. Workaround: pass the UUID directly as css color (e.g. use a global class that references the variable).',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$sections = isset( $input['sections'] ) && is_array( $input['sections'] ) ? $input['sections'] : [];
		$dry_run  = ! empty( $input['dry_run'] );

		$created_post = null;

		if ( isset( $input['post_id'] ) ) {
			$post_id = (int) $input['post_id'];
		} else {
			if ( empty( $input['title'] ) || ! is_string( $input['title'] ) ) {
				throw new \InvalidArgumentException( 'make-page: either post_id or title is required.' );
			}
			if ( ! $dry_run ) {
				$created_post = ( new Create_Post_Ability() )->execute( [
					'title'       => $input['title'],
					'post_type'   => $input['post_type'] ?? 'page',
					'post_status' => $input['post_status'] ?? 'draft',
					'slug'        => $input['slug'] ?? '',
				] );
				$post_id = $created_post['post_id'];
			} else {
				$post_id = 0;
			}
		}

		$spec_errors = [];
		foreach ( $sections as $i => $section ) {
			$this->validate_spec( $section, "sections[$i]", $spec_errors );
		}

		if ( ! empty( $spec_errors ) && $dry_run ) {
			return [
				'success' => false,
				'post_id' => $post_id,
				'dry_run' => true,
				'errors'  => $spec_errors,
			];
		}
		if ( ! empty( $spec_errors ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'make-page spec validation failed:' . "\n - " . implode( "\n - ", $spec_errors ) );
		}

		$elements = [];
		foreach ( $sections as $section ) {
			$elements[] = $this->build_element( $section );
		}

		$result = ( new Build_Page_Ability() )->execute( [
			'post_id'  => $post_id,
			'elements' => $elements,
			'dry_run'  => $dry_run,
		] );

		if ( null !== $created_post ) {
			$result['edit_url']  = $created_post['edit_url'];
			$result['permalink'] = $created_post['permalink'];
		}

		return $result;
	}

	private function validate_spec( $node, string $path, array &$errors ): void {
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
			$errors[] = "$path.id: expected 7-hex string, got `$id_val`.";
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

	private function did_you_mean( string $input, array $candidates ): ?string {
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
		// Only suggest when the edit distance is small relative to input length.
		if ( null !== $best && $best_dist <= max( 2, (int) floor( strlen( $input ) / 3 ) ) ) {
			return $best;
		}
		return null;
	}

	private function build_element( array $spec ): array {
		$id       = isset( $spec['id'] ) && is_string( $spec['id'] ) && '' !== $spec['id'] ? $spec['id'] : Utils::generate_id();
		$widget   = isset( $spec['widget'] ) && is_string( $spec['widget'] ) ? strtolower( $spec['widget'] ) : null;
		$css      = isset( $spec['css'] ) && is_string( $spec['css'] ) ? trim( $spec['css'] ) : '';
		$classes  = isset( $spec['classes'] ) && is_array( $spec['classes'] ) ? array_values( array_filter( $spec['classes'], 'is_string' ) ) : [];
		$children = isset( $spec['children'] ) && is_array( $spec['children'] ) ? $spec['children'] : null;

		$settings = [];
		$styles   = [];

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
			$el_type = self::CONTAINER_SYNONYMS[ $widget ];
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

		// Implicit container — has children but no widget.
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

		// Leaf widget.
		$widget_type = self::LEAF_WIDGETS[ $widget ] ?? null;
		if ( null === $widget_type ) {
			// Should be unreachable if validate_spec passed; defensive fallback.
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

			// image-src expects raw null OR a wrapped Prop_Type for each field.
			// Exactly one of {id, url} must be set (Image_Src_Prop_Type::validate_value).
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

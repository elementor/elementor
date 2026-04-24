<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds a single section element from a pattern-shaped spec.
 *
 * Unlike make-page, this ability does NOT save — it returns one ready-to-paste e-flexbox
 * node that callers can drop into build-page / set-post-content / append-elements.
 * Matches the make-widget / make-layout contract.
 *
 * Supports four layouts: `hero`, `two-column`, `card-grid`, `centered`. Each accepts a
 * common set of content shortcuts (eyebrow / heading / subtext / cta_text) plus
 * layout-specific arrays (columns / cards / widgets).
 */
class Make_Section_Ability extends Abstract_Ability {

	use Css_Shorthand_Parser;

	private const VALID_LAYOUTS  = [ 'hero', 'two-column', 'card-grid', 'centered' ];
	private const HEADING_TAGS   = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];

	protected function get_name(): string {
		return 'elementor/make-section';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor Make Section',
			'description'  => 'Builds a single section element from a pattern-shaped spec (hero / two-column / card-grid / centered). Returns one e-flexbox node; does not save. Feed to build-page or set-post-content to persist.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [
					'id'          => [ 'type' => 'string', 'description' => 'Outer e-flexbox ID (7-hex). Auto-generated when omitted.' ],
					'layout'      => [ 'type' => 'string', 'description' => 'Section pattern. One of: hero, two-column, card-grid, centered.' ],
					'classes'     => [ 'type' => 'array', 'description' => 'Global class IDs or labels for the outer container.' ],
					'style'       => [ 'type' => 'string', 'description' => 'CSS for the outer container — auto-generates a local style keyed "{id}-s".' ],

					'eyebrow'     => [ 'type' => 'string', 'description' => '[hero/centered] Small eyebrow text above the heading.' ],
					'heading'     => [ 'type' => 'string', 'description' => '[hero/centered/two-column] Main heading text.' ],
					'heading_tag' => [ 'type' => 'string', 'description' => '[hero/centered/two-column] HTML tag, h1–h6. Default h2.' ],
					'subtext'     => [ 'type' => 'string', 'description' => '[hero/centered/two-column] Paragraph text below the heading.' ],
					'cta_text'    => [ 'type' => 'string', 'description' => '[hero] CTA button label.' ],

					'columns'     => [ 'type' => 'array', 'description' => '[two-column] Column specs: { id?, classes?, style?, weight?, widgets[] }.' ],
					'cards'       => [ 'type' => 'array', 'description' => '[card-grid] Card specs: { id?, classes?, style?, image_id?, image_alt?, heading?, body? }.' ],
					'widgets'     => [ 'type' => 'array', 'description' => '[centered] Ordered widget list: { id, type, classes?, style?, content? }. type is the full e-* widget type.' ],
				],
				'required'             => [ 'layout' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'element' => [ 'type' => 'object', 'description' => 'Ready-to-paste e-flexbox node.' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Four layout patterns → one e-flexbox node. Does NOT save — pass the returned element to build-page / set-post-content / append-elements.',
						'hero: outer flex with eyebrow + heading + subtext + CTA button. Use eyebrow / heading / subtext / cta_text fields.',
						'two-column: outer flex with N columns. Pass columns[] with { id?, classes?, style?, weight?, widgets[] }. When no columns[] supplied, falls back to heading/subtext in the left column and empty right column.',
						'card-grid: outer flex with card columns (image + heading + body per card). Pass cards[] with { id?, classes?, style?, image_id?, image_alt?, heading?, body? }.',
						'centered: outer flex with a stacked widget list. Pass widgets[] with { id, type, classes?, style?, content? }; or use heading/subtext/eyebrow shorthands.',
						'STYLES: every `style` field runs through elementor/css-to-props (shorthand → dimensions, flex shorthand, inset-* rewrite, etc.). The style is attached as a local style keyed "{targetId}-s" and auto-mirrored into classes.value.',
						'HEADING_TAG: default h2. Must be h1–h6.',
						'COLUMN WEIGHT: when `weight` is set on a column, an auto-generated flex-grow local style is attached and mirrored into classes.value.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$layout = isset( $input['layout'] ) && is_string( $input['layout'] ) ? strtolower( $input['layout'] ) : '';
		if ( ! in_array( $layout, self::VALID_LAYOUTS, true ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'make-section: layout must be one of ' . implode( ', ', self::VALID_LAYOUTS ) . '.' );
		}

		$heading_tag = isset( $input['heading_tag'] ) && is_string( $input['heading_tag'] ) ? strtolower( $input['heading_tag'] ) : 'h2';
		if ( ! in_array( $heading_tag, self::HEADING_TAGS, true ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "make-section: heading_tag=`{$heading_tag}` is invalid. Valid: " . implode( ', ', self::HEADING_TAGS ) . '.' );
		}

		$section_id = isset( $input['id'] ) && is_string( $input['id'] ) && '' !== $input['id'] ? $input['id'] : Utils::generate_id();
		$classes    = isset( $input['classes'] ) && is_array( $input['classes'] ) ? array_values( array_filter( $input['classes'], 'is_string' ) ) : [];

		$children = [];
		switch ( $layout ) {
			case 'hero':
				$children = $this->build_hero( $input, $heading_tag );
				break;
			case 'two-column':
				$children = $this->build_two_column( $input, $heading_tag );
				break;
			case 'card-grid':
				$children = $this->build_card_grid( $input );
				break;
			case 'centered':
				$children = $this->build_centered( $input, $heading_tag );
				break;
		}

		$node = $this->make_flexbox( $section_id, $classes, $children );

		$style = isset( $input['style'] ) && is_string( $input['style'] ) ? trim( $input['style'] ) : '';
		if ( '' !== $style ) {
			$this->inject_style( $node, $section_id . '-s', $style );
		}

		return [ 'element' => $node ];
	}

	private function build_hero( array $input, string $heading_tag ): array {
		$children = [];
		if ( ! empty( $input['eyebrow'] ) && is_string( $input['eyebrow'] ) ) {
			$children[] = $this->make_paragraph( Utils::generate_id(), $input['eyebrow'] );
		}
		if ( ! empty( $input['heading'] ) && is_string( $input['heading'] ) ) {
			$children[] = $this->make_heading( Utils::generate_id(), $input['heading'], $heading_tag );
		}
		if ( ! empty( $input['subtext'] ) && is_string( $input['subtext'] ) ) {
			$children[] = $this->make_paragraph( Utils::generate_id(), $input['subtext'] );
		}
		if ( ! empty( $input['cta_text'] ) && is_string( $input['cta_text'] ) ) {
			$children[] = $this->make_button( Utils::generate_id(), $input['cta_text'] );
		}
		return $children;
	}

	private function build_two_column( array $input, string $heading_tag ): array {
		$columns = isset( $input['columns'] ) && is_array( $input['columns'] ) ? $input['columns'] : null;

		if ( null === $columns || empty( $columns ) ) {
			$left_children = [];
			if ( ! empty( $input['heading'] ) && is_string( $input['heading'] ) ) {
				$left_children[] = $this->make_heading( Utils::generate_id(), $input['heading'], $heading_tag );
			}
			if ( ! empty( $input['subtext'] ) && is_string( $input['subtext'] ) ) {
				$left_children[] = $this->make_paragraph( Utils::generate_id(), $input['subtext'] );
			}
			return [
				$this->make_flexbox( Utils::generate_id(), [], $left_children ),
				$this->make_flexbox( Utils::generate_id(), [], [] ),
			];
		}

		$cols = [];
		foreach ( $columns as $col ) {
			if ( ! is_array( $col ) ) {
				continue;
			}
			$col_id      = isset( $col['id'] ) && is_string( $col['id'] ) && '' !== $col['id'] ? $col['id'] : Utils::generate_id();
			$col_classes = isset( $col['classes'] ) && is_array( $col['classes'] ) ? array_values( array_filter( $col['classes'], 'is_string' ) ) : [];
			$col_widgets = isset( $col['widgets'] ) && is_array( $col['widgets'] ) ? $col['widgets'] : [];

			$col_children = [];
			foreach ( $col_widgets as $w ) {
				if ( ! is_array( $w ) ) {
					continue;
				}
				$col_children[] = $this->make_content_widget( $w );
			}

			$col_el = $this->make_flexbox( $col_id, $col_classes, $col_children );

			if ( isset( $col['weight'] ) && is_numeric( $col['weight'] ) ) {
				$flex_id = $col_id . '-flex';
				$col_el['styles'] = $col_el['styles'] ?? [];
				$col_el['styles'][ $flex_id ] = [
					'id'       => $flex_id,
					'type'     => 'class',
					'label'    => 'local',
					'variants' => [
						[
							'meta'  => [
								'breakpoint' => 'desktop',
								'state'      => null,
							],
							'props' => [
								'flex' => [
									'$$type' => 'flex',
									'value'  => [
										'flexGrow' => [
											'$$type' => 'number',
											'value'  => (float) $col['weight'],
										],
									],
								],
								'flex-direction' => [
									'$$type' => 'string',
									'value'  => 'column',
								],
							],
						],
					],
				];
				$col_el['settings']['classes']['value'][] = $flex_id;
			}

			if ( ! empty( $col['style'] ) && is_string( $col['style'] ) ) {
				$this->inject_style( $col_el, $col_id . '-s', $col['style'] );
			}

			$cols[] = $col_el;
		}
		return $cols;
	}

	private function build_card_grid( array $input ): array {
		$cards = isset( $input['cards'] ) && is_array( $input['cards'] ) ? $input['cards'] : [];
		$out   = [];
		foreach ( $cards as $card ) {
			if ( ! is_array( $card ) ) {
				continue;
			}
			$card_id      = isset( $card['id'] ) && is_string( $card['id'] ) && '' !== $card['id'] ? $card['id'] : Utils::generate_id();
			$card_classes = isset( $card['classes'] ) && is_array( $card['classes'] ) ? array_values( array_filter( $card['classes'], 'is_string' ) ) : [];

			$children = [];
			if ( ! empty( $card['image_id'] ) && is_numeric( $card['image_id'] ) ) {
				$alt        = isset( $card['image_alt'] ) && is_string( $card['image_alt'] ) ? $card['image_alt'] : '';
				$children[] = $this->make_image( Utils::generate_id(), (int) $card['image_id'], $alt );
			}
			if ( ! empty( $card['heading'] ) && is_string( $card['heading'] ) ) {
				$children[] = $this->make_heading( Utils::generate_id(), $card['heading'], 'h2' );
			}
			if ( ! empty( $card['body'] ) && is_string( $card['body'] ) ) {
				$children[] = $this->make_paragraph( Utils::generate_id(), $card['body'] );
			}

			$card_el = $this->make_flexbox( $card_id, $card_classes, $children );

			if ( ! empty( $card['style'] ) && is_string( $card['style'] ) ) {
				$this->inject_style( $card_el, $card_id . '-s', $card['style'] );
			}

			$out[] = $card_el;
		}
		return $out;
	}

	private function build_centered( array $input, string $heading_tag ): array {
		$widgets = isset( $input['widgets'] ) && is_array( $input['widgets'] ) ? $input['widgets'] : null;
		if ( null !== $widgets && ! empty( $widgets ) ) {
			$out = [];
			foreach ( $widgets as $w ) {
				if ( ! is_array( $w ) ) {
					continue;
				}
				$out[] = $this->make_content_widget( $w );
			}
			return $out;
		}

		$children = [];
		if ( ! empty( $input['eyebrow'] ) && is_string( $input['eyebrow'] ) ) {
			$children[] = $this->make_paragraph( Utils::generate_id(), $input['eyebrow'] );
		}
		if ( ! empty( $input['heading'] ) && is_string( $input['heading'] ) ) {
			$children[] = $this->make_heading( Utils::generate_id(), $input['heading'], $heading_tag );
		}
		if ( ! empty( $input['subtext'] ) && is_string( $input['subtext'] ) ) {
			$children[] = $this->make_paragraph( Utils::generate_id(), $input['subtext'] );
		}
		return $children;
	}

	private function make_content_widget( array $spec ): array {
		$id      = isset( $spec['id'] ) && is_string( $spec['id'] ) && '' !== $spec['id'] ? $spec['id'] : Utils::generate_id();
		$type    = isset( $spec['type'] ) && is_string( $spec['type'] ) ? $spec['type'] : 'e-paragraph';
		$classes = isset( $spec['classes'] ) && is_array( $spec['classes'] ) ? array_values( array_filter( $spec['classes'], 'is_string' ) ) : [];
		$content = isset( $spec['content'] ) && is_array( $spec['content'] ) ? $spec['content'] : [];

		$settings = [
			'classes' => [
				'$$type' => 'classes',
				'value'  => $classes,
			],
		];

		$text = isset( $content['text'] ) && is_string( $content['text'] ) ? $content['text'] : null;
		$tag  = isset( $content['tag'] ) && is_string( $content['tag'] ) ? strtolower( $content['tag'] ) : null;

		if ( null !== $text ) {
			$wrapped = $this->make_html_v3( $text );
			if ( 'e-heading' === $type ) {
				$settings['title'] = $wrapped;
				if ( null !== $tag ) {
					$settings['tag'] = [
						'$$type' => 'string',
						'value'  => $tag,
					];
				}
			} elseif ( 'e-paragraph' === $type ) {
				$settings['paragraph'] = $wrapped;
			} else {
				$settings['text'] = $wrapped;
			}
		}

		if ( ! empty( $content['image_id'] ) && is_numeric( $content['image_id'] ) ) {
			$alt               = isset( $content['alt'] ) && is_string( $content['alt'] ) ? $content['alt'] : '';
			$settings['image'] = $this->image_value( (int) $content['image_id'], $alt );
		}

		$node = [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => $type,
			'settings'   => $settings,
		];

		if ( ! empty( $spec['style'] ) && is_string( $spec['style'] ) ) {
			$this->inject_style( $node, $id . '-s', $spec['style'] );
		}

		return $node;
	}

	private function make_heading( string $id, string $text, string $tag ): array {
		return [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => 'e-heading',
			'settings'   => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => [],
				],
				'title'   => $this->make_html_v3( $text ),
				'tag'     => [
					'$$type' => 'string',
					'value'  => $tag,
				],
			],
		];
	}

	private function make_paragraph( string $id, string $text ): array {
		return [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => 'e-paragraph',
			'settings'   => [
				'classes'   => [
					'$$type' => 'classes',
					'value'  => [],
				],
				'paragraph' => $this->make_html_v3( $text ),
			],
		];
	}

	private function make_button( string $id, string $text ): array {
		return [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => 'e-button',
			'settings'   => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => [],
				],
				'text'    => $this->make_html_v3( $text ),
				'tag'     => [
					'$$type' => 'string',
					'value'  => 'a',
				],
			],
		];
	}

	private function make_image( string $id, int $attachment_id, string $alt ): array {
		return [
			'id'         => $id,
			'elType'     => 'widget',
			'widgetType' => 'e-image',
			'settings'   => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => [],
				],
				'image'   => $this->image_value( $attachment_id, $alt ),
			],
		];
	}

	private function make_flexbox( string $id, array $classes, array $children ): array {
		return [
			'id'       => $id,
			'elType'   => 'e-flexbox',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value'  => array_values( array_unique( array_filter( $classes, 'is_string' ) ) ),
				],
			],
			'elements' => array_values( $children ),
		];
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

	private function image_value( int $attachment_id, string $alt ): array {
		return [
			'$$type' => 'image',
			'value'  => [
				'src'  => [
					'$$type' => 'image-src',
					'value'  => [
						'id'  => $attachment_id,
						'url' => null,
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

	private function inject_style( array &$node, string $style_id, string $css ): void {
		$node['styles']                       = $node['styles'] ?? [];
		$node['styles'][ $style_id ]          = [
			'id'       => $style_id,
			'type'     => 'class',
			'label'    => 'local',
			'variants' => [
				[
					'meta'  => [
						'breakpoint' => 'desktop',
						'state'      => null,
					],
					'props' => $this->css_to_props( $css ),
				],
			],
		];
		$node['settings']['classes']          = $node['settings']['classes'] ?? [
			'$$type' => 'classes',
			'value'  => [],
		];
		$node['settings']['classes']['value'] = $node['settings']['classes']['value'] ?? [];
		if ( ! in_array( $style_id, $node['settings']['classes']['value'], true ) ) {
			$node['settings']['classes']['value'][] = $style_id;
		}
	}
}

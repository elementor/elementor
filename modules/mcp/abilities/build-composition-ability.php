<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\Variables\Module as Variables_Module;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Composition_Ability extends Abstract_Ability {

	const CONFIGURATION_ID_ATTRIBUTE = 'configuration-id';

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/build-composition';
	}

	/**
	 * Kept in sync with packages/packages/core/editor-canvas/src/mcp/tools/build-composition/prompt.ts
	 */
	private function get_ability_description(): string {
		return <<<'PROMPT'
# RESOURCES (Read before use)
- [elementor://global-classes] - Check FIRST for reusable classes
- [elementor://global-variables] - Design tokens for styling: use labels in CSS as `var(--label)` or `var(--label, fallback)`; ONLY variables listed here are valid
- [elementor/list-widgets?version=v4] - Available v4 widgets

# TOOL SUPPORT
This tool supports v4 elements only.

# WORKFLOW
1. Check/create global variables via "elementor/manage-global-variable" tool
2. Build composition (THIS TOOL) - minimal inline styles
3. Use returned element IDs for subsequent configuration changes

# XML STRUCTURE
- Use widget tags: `<e-button configuration-id="btn1"></e-button>`
- Containers: "e-flexbox", "e-div-block", "e-tabs"
- **Every element MUST have a unique "configuration-id" attribute**
- No attributes, classes, IDs, or text nodes in XML

## NESTED ELEMENTS
Some elements have internal tree structures (nesting). When using these elements, you MUST build the FULL tree in XML.
- Check `llm_guidance.nesting` in widget schemas for structure requirements
- `llm_guidance.required_direct_children` lists element types that must appear as direct child tags in XML (from widget defaults)
- `allowed_child_types` lists which element types can be nested inside
- `allowed_parents` lists which element types this element can be placed inside

# CONFIGURATION
- Map configuration-id → element_config (props) + style (raw CSS declarations)
- element_config PropValues require `$$type` matching schema
- **Prop names must come from the widget schema (use elementor/get-widget-schema tool with the widget type); unknown keys are rejected with a list of valid keys**
- style is raw CSS (property → value strings); the server converts it to native styles
- **CSS shorthand properties may fall back to custom_css which is stripped by Pro 3.35+; prefer longhand properties (e.g., `padding-top`, `padding-right` instead of `padding`)**
- NO LINKS in configuration
- Retry on errors up to 10x
- Check `llm_guidance.default_settings` in widget schemas — omit only keys listed there from element_config unless the user explicitly asks to change them

## VARIABLE USAGE
Read [elementor://global-variables] before styling. Use variable **labels** from that list — not internal ids.

**In `style` (raw CSS):** reference by label only:
- `color: var(--wc26-gold)` or `color: var(--wc26-gold, #C6A15B)`
- `font-family: var(--font-heading)` or `font-size: var(--spacing-lg, 1.5rem)`
- Do NOT use the internal `e-gv-` id prefix (e.g. `var(--e-gv-wc26-gold)` is wrong; use `var(--wc26-gold)`)
- Unrecognized variable references fall back to `custom_css`, which may not render on Pro 3.35+

**In `element_config` (PropValues):** when the widget schema allows a global-variable type, send the label or id as the value:
- `{ "$$type": "global-color-variable", "value": "wc26-gold" }`
- `{ "$$type": "global-font-variable", "value": "font-heading" }`
- `{ "$$type": "global-size-variable", "value": "spacing-lg" }`

# DYNAMIC TAGS
- A value can be made dynamic wherever its schema exposes a `"$$type": "dynamic"` variant. This may be the property root OR a NESTED field (e.g. an image's `src`, not the whole `image`).
- Put the dynamic object EXACTLY at that node, in place of the static variant. The variant's `name` lists the allowed tags; read [elementor://dynamic-tags] for each tag's settings schema.
- Provide at that node: `{ "$$type": "dynamic", "value": { "name": "<allowed tag>", "settings": { ... } } }`
- Example (image): `{ "$$type": "image", "value": { "src": { "$$type": "dynamic", "value": { "name": "<image tag>", "settings": { ... } } } } }`
- Do NOT send `group` (it is resolved automatically). Populate `settings` strictly per the tag's schema; use `{}` only when it has none.

Note about configuration ids: These names are visible to the end-user, make sure they make sense, related and relevant.

# DESIGN PHILOSOPHY: CONTEXT-DRIVEN CREATIVITY

**Use the user's context aggressively.** Business type, brand personality, target audience, and purpose should drive every design decision. A law firm needs gravitas; a children's app needs playfulness. Don't default to generic.

## SIZING: DEFAULT IS NO SIZE (CRITICAL)

**DO NOT specify height or width unless you have a specific visual reason.**

Flexbox and CSS already handle sizing automatically:
- Containers grow to fit their content
- Flex children distribute space via flex properties, not width/height
- Text elements size to their content

WHEN TO SPECIFY SIZE:
- min-height on ROOT section for viewport-spanning hero (use min-height, NOT height)
- max-width for contained content areas (e.g., max-width: 60rem)
- Explicit aspect ratios for media containers

NEVER SPECIFY:
- height on nested containers (causes overflow)
- width on flex children (use flex-basis or gap instead)
- 100vh on anything except root-level sections
- Any size "just to be safe" - if unsure, OMIT IT

vh units are VIEWPORT-relative. Nested 100vh inside 100vh = 200vh overflow.

GOOD: `<e-flexbox>content naturally sizes</e-flexbox>`
BAD: `<e-flexbox style="height:100vh"><e-div-block style="height:100vh">overflow</e-div-block></e-flexbox>`

## Layout Variety (Break the Template)
- AVOID: Full-width 100vh hero → three columns → testimonials → CTA (every AI does this)
- VARY heights: Use auto-height sections with generous padding (6rem+). Let content breathe
- VARY widths: Not everything spans full width. Use contained sections (max-width: 960px) mixed with edge-to-edge
- ASYMMETRIC grids: 2:1, 1:3, offset layouts. Avoid equal column widths
- Negative space as design element: Large margins create focus and sophistication
- Break alignment intentionally: Offset headings, overlapping elements, broken grids

## Visual Depth & Effects
- Layer elements: Overlapping cards, text over images, floating elements
- Subtle shadows with color tint (not pure black): `box-shadow: 0 20px 60px rgba(<brand-color-here>, 0.15)`
- Gradient overlays on images for text readability
- Border radius variation: Mix sharp (0) and soft (1rem+) corners purposefully
- Backdrop blur for glassmorphism where appropriate
- Micro-interactions via CSS: hover transforms, transitions (0.3s ease)

## Typography with Character
- Display fonts for headlines (from user's brand or contextually appropriate)
- Size contrast: 4rem+ headlines vs 1rem body. Make hierarchy unmistakable
- Letter-spacing: Tight for large headlines (-0.02em), loose for small caps (0.1em)
- Line-height: Tight for headlines (1.1), generous for body (1.6-1.8)
- Text decoration: Underlines, highlights, gradient text for emphasis

## Color with Purpose
- Extract palette from user context (brand colors, industry norms, mood)
- 60-30-10 rule: dominant, secondary, accent
- Tinted neutrals over pure grays: warm (#faf8f5, #2d2a26) or cool (#f5f7fa, #1e2430)
- Color blocking: Large colored sections create visual rhythm
- Gradient directions: Diagonal (135deg, 225deg) feel more dynamic than vertical

## Spacing Strategy
- Section padding: 6rem-10rem vertical, creating breathing room
- Rhythm variation: Tight groups (2rem) with generous gaps between (6rem)
- Use rem/em exclusively for responsive scaling
- Generous padding on CTAs: min 1rem 2.5rem

# HARD CONSTRAINTS
- Variables ONLY from [elementor://global-variables]; reference labels in CSS as `var(--label)` — the `e-gv-` prefix is internal only and must not appear in `style` or `element_config`
- Avoid SVG widgets unless assets are pre-uploaded
- Check `llm_guidance` in widget schemas (`default_styles`, nesting, required children)

# PARAMETERS
- **post_id**: WordPress post ID of the document to mutate
- **xml_structure**: Valid XML with configuration-id attributes on every element
- **element_config**: configuration-id → widget PropValues
- **style**: configuration-id → raw CSS declarations (property → value strings; no selectors)
- **parent_id**: ID of the parent container (omit to insert at document root)
- **dry_run**: If true, validate and return resolved tree without persisting

# EXAMPLE
Section with heading + button (NO explicit heights - content sizes naturally):
```json
{
  "post_id": 123,
  "xml_structure": "<e-flexbox configuration-id=\"Main Section\"><e-heading configuration-id=\"Section Title\"></e-heading><e-button configuration-id=\"Call to Action\"></e-button></e-flexbox>",
  "element_config": {
    "Main Section": { "tag": { "$$type": "string", "value": "section" } },
    "Section Title": { "tag": { "$$type": "string", "value": "h2" } }
  },
  "style": {
    "Main Section": {
      "padding": "6rem 4rem",
      "background": "linear-gradient(135deg, #faf8f5 0%, #f0ebe4 100%)"
    },
    "Section Title": {
      "font-size": "3.5rem",
      "color": "#2d2a26"
    }
  }
}
```
Note: No height/width specified on any element - flexbox handles layout automatically.

# FURTHER INSTRUCTIONS
Element IDs in the returned XML represent actual widgets. Use these IDs for subsequent styling or configuration changes.
PROMPT;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Build Composition', 'elementor' ),
			$this->get_ability_description(),
			'elementor',
			[
				'type' => 'object',
				'required' => [ 'success', 'post_id', 'root_element_ids', 'preview_url', 'version' ],
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'post_id' => [ 'type' => 'integer' ],
					'root_element_ids' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
						'description' => 'IDs of the created root-level elements.',
					],
					'preview_url' => [
						'type' => 'string',
						'format' => 'uri',
					],
					'version' => [ 'type' => 'string' ],
					'resolved_xml' => [
						'type' => 'string',
						'description' => 'The XML with element IDs embedded.',
					],
					'llm_instructions' => [
						'type' => 'string',
						'description' => 'Next-step instructions for the LLM.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id', 'xml_structure' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the document to mutate.',
					],
					'xml_structure' => [
						'type' => 'string',
						'description' => 'Valid XML structure with custom Elementor widget tags. Every element MUST have a unique configuration-id attribute (e.g. <e-heading configuration-id="hero-title"></e-heading>). No attributes, classes, IDs, or text nodes in XML.',
					],
					'element_config' => [
						'type' => 'object',
						'default' => (object) [],
						'description' => 'Record mapping configuration-id → widget PropValues ($$type + value). Keys MUST match configuration-id attributes in xml_structure.',
					],
					'style' => [
						'type' => 'object',
						'default' => (object) [],
						'description' => 'Record mapping configuration-id → raw CSS declarations (property → value strings; no selectors). Keys MUST match configuration-id attributes in xml_structure. Server converts to native styles; unconvertible declarations become the element custom CSS.',
					],
					'parent_id' => [
						'type' => 'string',
						'default' => 'document',
						'description' => 'ID of the parent container. Omit to insert at document root.',
					],
					'dry_run' => [
						'type' => 'boolean',
						'default' => false,
						'description' => 'If true, validate and return resolved tree without persisting.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$validation_error = $this->validate_input( $input );
		if ( is_wp_error( $validation_error ) ) {
			return $validation_error;
		}

		$post_id = (int) $input['post_id'];
		$xml_structure = (string) $input['xml_structure'];
		$parent_id = $input['parent_id'] ?? 'document';
		$dry_run = ! empty( $input['dry_run'] );

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'elementor_forbidden',
				__( 'You do not have permission to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$document = $this->resolve_document( $post_id );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$dom = $this->parse_xml( $xml_structure );
		if ( is_wp_error( $dom ) ) {
			return $dom;
		}

		$widget_configs = $this->collect_used_widget_configs( $dom );
		if ( is_wp_error( $widget_configs ) ) {
			return $widget_configs;
		}

		$child_type_error = $this->validate_child_types( $dom, $widget_configs );
		if ( is_wp_error( $child_type_error ) ) {
			return $child_type_error;
		}

		$root_subtrees = $this->build_subtrees_from_dom( $dom, $widget_configs );

		$config_id_index = $this->index_subtrees_by_config_id( $root_subtrees, $dom );

		$element_config = $this->normalize_map_input( $input['element_config'] ?? [] );
		$styles = $this->normalize_map_input( $input['style'] ?? [] );

		$this->debug_log(
			'build-composition-ability.php:execute:input',
			'Build composition input summary',
			[
				'post_id' => $post_id,
				'dry_run' => $dry_run,
				'parent_id' => $parent_id,
				'config_ids_in_xml' => array_keys( $config_id_index ),
				'element_config_ids' => array_keys( $element_config ),
				'style_config_ids' => array_keys( $styles ),
				'widget_types' => array_keys( $widget_configs ),
			],
			'H1'
		);

		$settings_error = $this->apply_element_configs( $config_id_index, $element_config, $widget_configs );
		if ( is_wp_error( $settings_error ) ) {
			$this->debug_log(
				'build-composition-ability.php:execute:settings-error',
				'Element config validation failed',
				[
					'error_code' => $settings_error->get_error_code(),
					'error_message' => $settings_error->get_error_message(),
				],
				'H2'
			);

			return $settings_error;
		}

		$styles_result = $this->apply_styles( $config_id_index, $styles );
		if ( is_wp_error( $styles_result['error'] ) ) {
			return $styles_result['error'];
		}
		$warnings = $styles_result['warnings'];

		if ( $dry_run ) {
			return $this->build_response( $post_id, $document, $root_subtrees, $dom, [], $warnings );
		}

		$root_ids = [];
		$tree = $document->get_elements_data();
		$tree = is_array( $tree ) ? $tree : [];

		foreach ( $root_subtrees as $subtree ) {
			$new_tree = $this->get_mutator()->insert_subtree( $tree, $parent_id, null, $subtree );
			if ( is_wp_error( $new_tree ) ) {
				return $new_tree;
			}
			$tree = $new_tree;
			$root_ids[] = $this->find_last_root_id( $tree, $parent_id );
		}

		// #region agent log
		$this->debug_log(
			'build-composition-ability.php:execute:before-save',
			'Tree state before document save',
			[
				'root_ids' => $root_ids,
				'persisted_root_summary' => $this->summarize_persisted_node( $tree, $root_ids[0] ?? '' ),
			],
			'H4'
		);
		// #endregion

		$save_result = $this->save_to_draft( $document, $tree );
		if ( is_wp_error( $save_result ) ) {
			return $save_result;
		}

		if ( ! $save_result ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$this->embed_ids_into_dom( $dom, $tree, $parent_id, $root_ids );

		return $this->build_response( $post_id, $document, $root_subtrees, $dom, $root_ids, $warnings );
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}

	private function validate_input( array $input ) {
		if ( empty( $input['post_id'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( empty( $input['xml_structure'] ) || ! is_string( $input['xml_structure'] ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'xml_structure is required and must be a string.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function resolve_document( int $post_id ) {
		$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id, get_current_user_id() );
		if ( ! $document ) {
			$document = Plugin::$instance->documents->get( $post_id );
		}
		if ( ! $document ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}
		return $document;
	}

	private function parse_xml( string $xml_structure ) {
		$wrapped = '<composition-root>' . $xml_structure . '</composition-root>';

		$previous = libxml_use_internal_errors( true );
		$dom = new \DOMDocument();
		$loaded = $dom->loadXML( $wrapped, LIBXML_NONET | LIBXML_NOENT );
		$errors = libxml_get_errors();
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded ) {
			$message = $errors ? $errors[0]->message : 'Unknown XML error.';
			return new \WP_Error(
				'invalid_xml',
				/* translators: %s: XML parse error message */
				sprintf( __( 'Failed to parse xml_structure: %s', 'elementor' ), trim( $message ) ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $dom;
	}

	/**
	 * @return array<string, array>|\WP_Error
	 */
	private function collect_used_widget_configs( \DOMDocument $dom ) {
		$configs = [];

		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return $configs;
		}

		$xpath = new \DOMXPath( $dom );
		foreach ( $xpath->query( './/*', $root ) as $node ) {
			if ( ! $node instanceof \DOMElement ) {
				continue;
			}
			$tag = $this->get_tag_name( $node );
			if ( isset( $configs[ $tag ] ) ) {
				continue;
			}

			$config = $this->resolve_type_config( $tag );
			if ( is_wp_error( $config ) ) {
				return $config;
			}
			$configs[ $tag ] = $config;
		}

		return $configs;
	}

	/**
	 * @return array|\WP_Error  ['elType', 'widgetType', 'allowed_child_types', 'class']
	 */
	private function resolve_type_config( string $type ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
		if ( $widget ) {
			$config = $widget->get_config();
			return [
				'elType' => 'widget',
				'widgetType' => $type,
				'allowed_child_types' => $config['allowed_child_types'] ?? [],
				'class' => get_class( $widget ),
			];
		}

		$element = Plugin::$instance->elements_manager->get_element_types( $type );
		if ( $element ) {
			$config = $element->get_config();
			return [
				'elType' => $type,
				'widgetType' => null,
				'allowed_child_types' => $config['allowed_child_types'] ?? [],
				'class' => get_class( $element ),
			];
		}

		return new \WP_Error(
			'elementor_unknown_type',
			/* translators: %s: element type */
			sprintf( __( 'Unknown element type: %s.', 'elementor' ), $type ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	/**
	 * @param \DOMDocument         $dom XML document.
	 * @param array<string, array> $widget_configs Resolved type configs indexed by tag.
	 * @return \WP_Error|null
	 */
	private function validate_child_types( \DOMDocument $dom, array $widget_configs ) {
		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return null;
		}

		$errors = [];
		$this->collect_child_type_errors( $root, $widget_configs, $errors );

		if ( ! empty( $errors ) ) {
			return new \WP_Error(
				'elementor_invalid_child_type',
				implode( ' ', $errors ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function collect_child_type_errors( \DOMElement $node, array $widget_configs, array &$errors ): void {
		$parent_tag = $this->get_tag_name( $node );
		$allowed = $widget_configs[ $parent_tag ]['allowed_child_types'] ?? [];

		foreach ( $this->get_child_elements( $node ) as $child ) {
			$child_tag = $this->get_tag_name( $child );

			if ( ! empty( $allowed ) && ! in_array( $child_tag, $allowed, true ) ) {
				$errors[] = sprintf(
					/* translators: 1: child tag 2: parent tag 3: allowed types */
					__( '"%1$s" is not allowed as a child of "%2$s". Allowed: %3$s.', 'elementor' ),
					$child_tag,
					$parent_tag,
					implode( ', ', $allowed )
				);
			}

			$this->collect_child_type_errors( $child, $widget_configs, $errors );
		}
	}

	/**
	 * @param \DOMDocument         $dom XML document.
	 * @param array<string, array> $widget_configs Resolved type configs indexed by tag.
	 * @return array[]
	 */
	private function build_subtrees_from_dom( \DOMDocument $dom, array $widget_configs ): array {
		$subtrees = [];
		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return $subtrees;
		}

		foreach ( $this->get_child_elements( $root ) as $child ) {
			$subtrees[] = $this->build_subtree( $child, $widget_configs );
		}

		return $subtrees;
	}

	private function build_subtree( \DOMElement $node, array $widget_configs ): array {
		$config = $widget_configs[ $this->get_tag_name( $node ) ];

		$children = [];
		foreach ( $this->get_child_elements( $node ) as $child ) {
			$children[] = $this->build_subtree( $child, $widget_configs );
		}

		$element = [
			'elType' => $config['elType'],
			'settings' => [],
			'elements' => $children,
			'editor_settings' => [],
		];

		if ( ! empty( $config['widgetType'] ) ) {
			$element['widgetType'] = $config['widgetType'];
		}

		if ( $node->hasAttribute( self::CONFIGURATION_ID_ATTRIBUTE ) ) {
			$element['editor_settings']['title'] = $node->getAttribute( self::CONFIGURATION_ID_ATTRIBUTE );
		}

		return $element;
	}

	/**
	 * Build an index of configuration-id -> reference to subtree node.
	 *
	 * @param array[]      $subtrees Built subtrees (mutated by reference downstream).
	 * @param \DOMDocument $dom      Source DOM.
	 * @return array<string, array&>
	 */
	private function index_subtrees_by_config_id( array &$subtrees, \DOMDocument $dom ): array {
		$index = [];
		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return $index;
		}
		$dom_roots = $this->get_child_elements( $root );

		foreach ( $subtrees as $i => &$subtree ) {
			if ( isset( $dom_roots[ $i ] ) ) {
				$this->index_subtree_recursive( $subtree, $dom_roots[ $i ], $index );
			}
		}
		unset( $subtree );

		return $index;
	}

	private function index_subtree_recursive( array &$subtree, \DOMElement $node, array &$index ): void {
		if ( $node->hasAttribute( self::CONFIGURATION_ID_ATTRIBUTE ) ) {
			$config_id = $node->getAttribute( self::CONFIGURATION_ID_ATTRIBUTE );
			$index[ $config_id ] = &$subtree;
		}

		$child_elements = $this->get_child_elements( $node );
		if ( ! isset( $subtree['elements'] ) || ! is_array( $subtree['elements'] ) ) {
			return;
		}
		foreach ( $subtree['elements'] as $i => &$child_subtree ) {
			if ( isset( $child_elements[ $i ] ) ) {
				$this->index_subtree_recursive( $child_subtree, $child_elements[ $i ], $index );
			}
		}
		unset( $child_subtree );
	}

	private function normalize_map_input( $value ): array {
		if ( is_object( $value ) ) {
			$value = (array) $value;
		}
		return is_array( $value ) ? $value : [];
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $element_config  Per-config-id settings.
	 * @param array<string, array>                $widget_configs  Resolved type configs.
	 * @return \WP_Error|null
	 */
	private function apply_element_configs( array $config_id_index, array $element_config, array $widget_configs ) {
		$errors = [];
		$applied = [];
		$skipped = [];
		$prop_resolutions = [];
		$transformers = Llm_Prop_Value_Adjuster::create_global_variable_transformers( $this->create_variables_service() );

		$this->debug_log(
			'build-composition-ability.php:apply_element_configs:start',
			'Starting element config application',
			[
				'element_config_count' => count( $element_config ),
				'variable_transformers' => array_keys( $transformers ),
			],
			'H3'
		);

		foreach ( $element_config as $config_id => $settings ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $settings ) ) {
				$skipped[] = [
					'config_id' => $config_id,
					'reason' => ! isset( $config_id_index[ $config_id ] ) ? 'config_id_not_in_index' : 'settings_not_array',
					'settings_keys' => is_array( $settings ) ? array_keys( $settings ) : gettype( $settings ),
				];
				continue;
			}

			$node = &$config_id_index[ $config_id ];
			$tag = $node['widgetType'] ?? $node['elType'] ?? null;
			$schema = $this->get_widget_props_schema( $tag, $widget_configs );

			if ( ! $schema ) {
				$node['settings'] = array_merge( $node['settings'] ?? [], $settings );
				$applied[] = [
					'config_id' => $config_id,
					'settings_keys' => array_keys( $node['settings'] ?? [] ),
					'alias_resolutions' => [],
				];
				continue;
			}

			$resolved_settings = [];
			$alias_resolutions = [];
			$element_type = $tag;

			foreach ( $settings as $name => $value ) {
				$canonical = Prop_Canonicalizer::resolve_canonical_key( $schema, $name );

				if ( null === $canonical ) {
					$available = Prop_Canonicalizer::available_prop_names( $schema );
					$prop_resolutions[] = [
						'config_id' => $config_id,
						'prop' => $name,
						'outcome' => 'unknown_prop',
						'input_summary' => $this->summarize_prop_value_for_debug( $value ),
					];
					$errors[] = sprintf(
						'[%s] Property "%s" does not exist on element type "%s". Available properties are: %s',
						$config_id,
						$name,
						$element_type,
						implode( ', ', $available )
					);
					continue;
				}

				$alias_resolutions[] = [
					'original_key' => $name,
					'canonical_key' => $canonical,
					'was_alias' => $name !== $canonical,
				];

				$prop_type = $schema[ $canonical ] ?? null;
				$force_key = $this->resolve_force_key_for_llm_adjust( $prop_type );
				$expected_type_hint = $this->resolve_primary_static_type_key( $prop_type ) ?? 'unknown';

				if ( ! is_array( $value ) ) {
					$prop_resolutions[] = [
						'config_id' => $config_id,
						'prop' => $canonical,
						'outcome' => 'scalar_rejected',
						'expected_type' => $expected_type_hint,
						'input_summary' => $this->summarize_prop_value_for_debug( $value ),
					];
					$errors[] = sprintf(
						'[%s] Property "%s" on "%s" expects a PropValue envelope, not a scalar. %s',
						$config_id,
						$canonical,
						$element_type,
						$this->format_expected_envelope_hint( $prop_type, $element_type )
					);
					continue;
				}

				$adjusted_value = Llm_Prop_Value_Adjuster::adjust(
					$value,
					[
						'force_key' => $force_key,
						'transformers' => $transformers,
					]
				);

				if ( null === $adjusted_value ) {
					$prop_resolutions[] = [
						'config_id' => $config_id,
						'prop' => $canonical,
						'outcome' => 'adjust_failed',
						'expected_type' => $expected_type_hint,
						'input_summary' => $this->summarize_prop_value_for_debug( $value ),
					];
					$errors[] = sprintf(
						'[%s] Property "%s" on "%s" could not be adjusted. %s',
						$config_id,
						$canonical,
						$element_type,
						$this->format_expected_envelope_hint( $prop_type, $element_type )
					);
					continue;
				}

				$prop_resolutions[] = [
					'config_id' => $config_id,
					'prop' => $canonical,
					'outcome' => 'resolved',
					'expected_type' => $expected_type_hint,
					'input_type' => $value['$$type'] ?? null,
					'output_summary' => $this->summarize_prop_value_for_debug( $adjusted_value ),
				];

				$resolved_settings[ $canonical ] = $adjusted_value;
			}

			$node['settings'] = array_merge( $node['settings'] ?? [], $resolved_settings );

			$validation_error = $this->validate_settings_against_schema( $node, $widget_configs, $config_id );
			if ( $validation_error ) {
				$errors[] = sprintf( '[%s] %s', $config_id, $validation_error );
			}

			$applied[] = [
				'config_id' => $config_id,
				'settings_keys' => array_keys( $node['settings'] ?? [] ),
				'alias_resolutions' => $alias_resolutions,
			];
		}
		unset( $node );

		$this->debug_log(
			'build-composition-ability.php:apply_element_configs',
			'Element config application summary',
			[
				'element_config_keys' => array_keys( $element_config ),
				'applied' => $applied,
				'skipped' => $skipped,
				'prop_resolutions' => $prop_resolutions,
				'validation_errors' => $errors,
			],
			'H3'
		);

		return $errors ? $this->build_validation_error( 'elementor_invalid_settings', $errors ) : null;
	}

	/**
	 * Gets the props schema for a widget/element type.
	 *
	 * @param string|null $tag            The element tag name.
	 * @param array       $widget_configs The resolved widget configs.
	 *
	 * @return array|null The props schema or null if not available.
	 */
	private function get_widget_props_schema( ?string $tag, array $widget_configs ): ?array {
		if ( ! $tag ) {
			return null;
		}

		$class = $widget_configs[ $tag ]['class'] ?? null;
		if ( ! $class || ! method_exists( $class, 'get_props_schema' ) ) {
			return null;
		}

		return $class::get_props_schema();
	}

	private function validate_settings_against_schema( array $node, array $widget_configs, ?string $config_id = null ): ?string {
		$tag = $node['widgetType'] ?? $node['elType'] ?? null;
		$schema = $this->get_widget_props_schema( $tag, $widget_configs );

		if ( ! $schema ) {
			return null;
		}

		$settings = $node['settings'] ?? [];
		$result = Props_Parser::make( $schema )->parse( $settings );

		if ( $result->is_valid() ) {
			return null;
		}

		$parser_errors = $result->errors()->to_string();

		$this->debug_log(
			'build-composition-ability.php:validate_settings_against_schema',
			'Props parser rejected settings',
			[
				'config_id' => $config_id,
				'element_type' => $tag,
				'parser_errors' => $parser_errors,
				'settings_summary' => $this->summarize_settings_for_debug( $settings ),
			],
			'H2'
		);

		return $parser_errors;
	}

	/**
	 * @param array<string, array&>               $config_id_index Index of subtree refs.
	 * @param array<string, array<string, mixed>> $styles          Per-config-id CSS blocks.
	 * @return array{error: \WP_Error|null, warnings: string[]}
	 */
	private function apply_styles( array $config_id_index, array $styles ): array {
		if ( empty( $styles ) ) {
			return [
				'error' => null,
				'warnings' => [],
			];
		}

		$converter = $this->create_css_converter();
		$style_parser = Style_Parser::make( Style_Schema::get() );
		$errors = [];
		$warnings = [];
		$applied = [];
		$skipped = [];
		$style_ids_per_config = [];

		foreach ( $styles as $config_id => $declarations ) {
			if ( ! isset( $config_id_index[ $config_id ] ) || ! is_array( $declarations ) ) {
				$skipped[] = [
					'config_id' => $config_id,
					'reason' => ! isset( $config_id_index[ $config_id ] ) ? 'config_id_not_in_index' : 'declarations_not_array',
				];
				continue;
			}

			$result = $this->convert_style_block( $converter, $declarations );

			if ( ! empty( $result['rejected'] ) ) {
				$errors[] = sprintf(
					'[%s] Invalid variable usage: %s. Variables must exist in [elementor://global-variables] and use label-only references (e.g., var(--wc26-gold), NOT var(--e-gv-wc26-gold)).',
					$config_id,
					implode( ', ', $result['rejected'] )
				);
				$skipped[] = [
					'config_id' => $config_id,
					'reason' => 'rejected_variable_references',
					'rejected' => $result['rejected'],
				];
				continue;
			}

			if ( empty( $result['props'] ) && empty( $result['customCss'] ) ) {
				$skipped[] = [
					'config_id' => $config_id,
					'reason' => 'css_converter_returned_empty',
					'declarations' => $declarations,
				];
				continue;
			}

			if ( ! empty( $result['customCss'] ) ) {
				$warnings[] = sprintf(
					'[%s] Some CSS properties fell back to custom_css which may not render on Pro 3.35+. Consider using longhand properties instead.',
					$config_id
				);
			}

			$node = &$config_id_index[ $config_id ];

			$existing_style_id = $style_ids_per_config[ $config_id ] ?? $this->get_existing_local_style_id( $node );

			if ( $existing_style_id ) {
				$merged_definition = $this->merge_into_existing_style(
					$node['styles'][ $existing_style_id ] ?? [],
					$result['props'],
					$result['customCss']
				);
				$parse_result = $style_parser->parse( $merged_definition );

				if ( ! $parse_result->is_valid() ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $parse_result->errors()->to_string() );
					$skipped[] = [
						'config_id' => $config_id,
						'reason' => 'style_parser_invalid',
						'parser_errors' => $parse_result->errors()->to_string(),
					];
					continue;
				}

				$node['styles'][ $existing_style_id ] = $parse_result->unwrap();
				$applied[] = [
					'config_id' => $config_id,
					'style_id' => $existing_style_id,
					'props_count' => count( $result['props'] ?? [] ),
					'has_custom_css' => ! empty( $result['customCss'] ),
					'merged' => true,
				];
			} else {
				$style_id = $this->generate_local_style_id();
				$style_definition = $this->build_local_style_definition( $style_id, $result['props'], $result['customCss'] );

				$parse_result = $style_parser->parse( $style_definition );
				if ( ! $parse_result->is_valid() ) {
					$errors[] = sprintf( '[%s] %s', $config_id, $parse_result->errors()->to_string() );
					$skipped[] = [
						'config_id' => $config_id,
						'reason' => 'style_parser_invalid',
						'parser_errors' => $parse_result->errors()->to_string(),
					];
					continue;
				}

				$node['styles'] = $node['styles'] ?? [];
				$node['styles'][ $style_id ] = $parse_result->unwrap();
				$node['settings'] = $this->add_style_to_classes( $node['settings'] ?? [], $style_id );
				$style_ids_per_config[ $config_id ] = $style_id;
				$applied[] = [
					'config_id' => $config_id,
					'style_id' => $style_id,
					'props_count' => count( $result['props'] ?? [] ),
					'has_custom_css' => ! empty( $result['customCss'] ),
					'merged' => false,
				];
			}
		}
		unset( $node );

		$first_applied_style_shape = null;
		if ( ! empty( $applied ) ) {
			$first = $applied[0];
			$first_config_id = $first['config_id'] ?? null;
			$first_style_id = $first['style_id'] ?? null;
			if ( $first_config_id && $first_style_id && isset( $config_id_index[ $first_config_id ] ) ) {
				$first_node = $config_id_index[ $first_config_id ];
				$first_applied_style_shape = $first_node['styles'][ $first_style_id ] ?? null;
			}
		}

		// #region agent log
		$this->debug_log(
			'build-composition-ability.php:apply_styles',
			'Style application summary',
			[
				'style_keys' => array_keys( $styles ),
				'applied' => $applied,
				'skipped' => $skipped,
				'validation_errors' => $errors,
				'warnings' => $warnings,
				'first_applied_style_shape' => $first_applied_style_shape,
			],
			'H5'
		);
		// #endregion

		return [
			'error' => $errors ? $this->build_validation_error( 'elementor_invalid_styles', $errors ) : null,
			'warnings' => $warnings,
		];
	}

	private function get_existing_local_style_id( array $node ): ?string {
		$styles = $node['styles'] ?? [];

		foreach ( $styles as $style_id => $style_def ) {
			if ( str_starts_with( $style_id, 's-' ) ) {
				return $style_id;
			}
		}

		return null;
	}

	private function merge_into_existing_style( array $existing_style, array $new_props, string $new_custom_css ): array {
		$variants = $existing_style['variants'] ?? [];
		$desktop_variant_index = null;

		foreach ( $variants as $index => $variant ) {
			$is_desktop = ( $variant['meta']['breakpoint'] ?? 'desktop' ) === 'desktop';
			$is_no_state = null === ( $variant['meta']['state'] ?? null );

			if ( $is_desktop && $is_no_state ) {
				$desktop_variant_index = $index;
				break;
			}
		}

		if ( null === $desktop_variant_index ) {
			$desktop_variant_index = count( $variants );
			$variants[] = [
				'meta' => [
					'breakpoint' => 'desktop',
					'state' => null,
				],
				'props' => [],
				'custom_css' => null,
			];
		}

		$variants[ $desktop_variant_index ]['props'] = array_merge(
			$variants[ $desktop_variant_index ]['props'] ?? [],
			$new_props
		);

		if ( '' !== $new_custom_css ) {
			$existing_raw = $variants[ $desktop_variant_index ]['custom_css']['raw'] ?? '';
			$existing_decoded = $existing_raw ? base64_decode( $existing_raw ) : ''; // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Local style custom_css.raw is stored as base64.
			$merged_raw = trim( $existing_decoded . "\n" . $new_custom_css );
			$variants[ $desktop_variant_index ]['custom_css'] = [
				'raw' => base64_encode( $merged_raw ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Local style custom_css.raw is stored as base64.
			];
		}

		return [
			'id' => $existing_style['id'] ?? null,
			'type' => $existing_style['type'] ?? 'class',
			'label' => $existing_style['label'] ?? 'local',
			'variants' => $variants,
		];
	}

	private function build_validation_error( string $code, array $errors ): \WP_Error {
		return new \WP_Error(
			$code,
			implode( ' ', $errors ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function create_css_converter(): Css_Converter {
		$variables_service = $this->create_variables_service();
		$variable_transformer = $variables_service
			? new Variable_Prop_Value_Transformer( $variables_service )
			: null;

		return new Css_Converter(
			Converter_Registry_Factory::create( $variables_service ),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create( $variables_service ),
			$variable_transformer
		);
	}

	private function create_variables_service(): ?Variables_Service {
		if ( ! $this->is_variables_active() ) {
			return null;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return null;
		}

		return new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);
	}

	private function is_variables_active(): bool {
		$experiments = Plugin::$instance->experiments;

		return $experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& $experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
	}

	/**
	 * @param Css_Converter              $converter    Shared converter.
	 * @param array<string, string|null> $declarations The block's property->value map.
	 * @return array{props: array, customCss: string, rejected: string[]}
	 */
	private function convert_style_block( Css_Converter $converter, array $declarations ): array {
		$css_parts = [];
		foreach ( $declarations as $property => $value ) {
			$is_null_reset = null === $value || 'null' === $value;
			$css_parts[] = $property . ': ' . ( $is_null_reset ? 'null' : $value ) . ';';
		}

		$result = $converter->convert( implode( ' ', $css_parts ) );
		return [
			'props' => $result['props'] ?? [],
			'customCss' => $result['customCss'] ?? '',
			'rejected' => $result['rejected'] ?? [],
		];
	}

	private function build_local_style_definition( string $style_id, array $props, string $custom_css ): array {
		$variant = [
			'meta' => [
				'breakpoint' => 'desktop',
				'state' => null,
			],
			'props' => $props,
			'custom_css' => '' !== $custom_css ? [ 'raw' => base64_encode( $custom_css ) ] : null, // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Local style custom_css.raw is stored as base64 for parity with client behavior.
		];

		return [
			'id' => $style_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [ $variant ],
		];
	}

	private function add_style_to_classes( array $settings, string $style_id ): array {
		$existing = $settings['classes']['value'] ?? [];
		if ( ! is_array( $existing ) ) {
			$existing = [];
		}
		if ( ! in_array( $style_id, $existing, true ) ) {
			$existing[] = $style_id;
		}

		$settings['classes'] = [
			'$$type' => 'classes',
			'value' => array_values( $existing ),
		];

		return $settings;
	}

	private function generate_local_style_id(): string {
		return 'e-' . strtolower( \Elementor\Utils::generate_random_string() ) . '-' . dechex( wp_rand( 0x1000, 0xffff ) );
	}

	private function find_last_root_id( array $tree, string $parent_id ): string {
		if ( 'document' === $parent_id ) {
			$last = end( $tree );
			return is_array( $last ) && isset( $last['id'] ) ? (string) $last['id'] : '';
		}

		$parent = $this->get_mutator()->find_by_id( $tree, $parent_id );
		if ( ! $parent || empty( $parent['elements'] ) ) {
			return '';
		}
		$last = end( $parent['elements'] );
		return is_array( $last ) && isset( $last['id'] ) ? (string) $last['id'] : '';
	}

	private function embed_ids_into_dom( \DOMDocument $dom, array $tree, string $parent_id, array $root_ids ): void {
		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return;
		}

		foreach ( $this->get_child_elements( $root ) as $index => $child ) {
			if ( ! isset( $root_ids[ $index ] ) ) {
				break;
			}
			$subtree_node = $this->find_persisted_subtree( $tree, $parent_id, $root_ids[ $index ] );
			if ( $subtree_node ) {
				$this->apply_ids_recursive( $child, $subtree_node );
			}
		}
	}

	private function find_persisted_subtree( array $tree, string $parent_id, string $root_id ): ?array {
		if ( 'document' === $parent_id ) {
			foreach ( $tree as $node ) {
				if ( isset( $node['id'] ) && $node['id'] === $root_id ) {
					return $node;
				}
			}
			return null;
		}
		return $this->get_mutator()->find_by_id( $tree, $root_id );
	}

	private function apply_ids_recursive( \DOMElement $node, array $subtree_node ): void {
		if ( ! empty( $subtree_node['id'] ) ) {
			$node->setAttribute( 'id', (string) $subtree_node['id'] );
		}

		$child_subtrees = $subtree_node['elements'] ?? [];
		foreach ( $this->get_child_elements( $node ) as $index => $child ) {
			if ( isset( $child_subtrees[ $index ] ) && is_array( $child_subtrees[ $index ] ) ) {
				$this->apply_ids_recursive( $child, $child_subtrees[ $index ] );
			}
		}
	}

	/**
	 * @param int          $post_id       The post ID.
	 * @param Document     $document      The document.
	 * @param array        $root_subtrees The root subtrees.
	 * @param \DOMDocument $dom           The DOM.
	 * @param array        $root_ids      The root IDs.
	 * @param string[]     $warnings      Warnings to include in the response.
	 */
	private function build_response( int $post_id, Document $document, array $root_subtrees, \DOMDocument $dom, array $root_ids, array $warnings = [] ): array {
		$post = get_post( $post_id );

		$response = [
			'success' => true,
			'post_id' => $post_id,
			'root_element_ids' => $root_ids,
			'preview_url' => $document->get_preview_url(),
			'version' => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
			'resolved_xml' => $this->serialize_composition_children( $dom ),
			'llm_instructions' => __( 'The composition was built successfully. Reload the editor to see the result.', 'elementor' ),
		];

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		return $response;
	}

	private function serialize_composition_children( \DOMDocument $dom ): string {
		$root = $this->get_document_root( $dom );
		if ( ! $root ) {
			return '';
		}

		$serialized = '';
		foreach ( $this->get_child_elements( $root ) as $child ) {
			$serialized .= $dom->saveXML( $child );
		}
		return $serialized;
	}

	private function get_document_root( \DOMDocument $dom ): ?\DOMElement {
		return $dom->documentElement ?? null; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMDocument API.
	}

	/**
	 * @return \DOMElement[]
	 */
	private function get_child_elements( \DOMElement $node ): array {
		$children = [];
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
		foreach ( $node->childNodes as $child ) {
			if ( $child instanceof \DOMElement ) {
				$children[] = $child;
			}
		}
		return $children;
	}

	private function get_tag_name( \DOMElement $node ): string {
		return $node->tagName; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- DOMElement API.
	}

	/**
	 * @return bool|\WP_Error
	 */
	private function debug_log( string $location, string $message, array $data, string $hypothesis_id ): void {
		$payload = wp_json_encode( [
			'sessionId' => '518cfe',
			'location' => $location,
			'message' => $message,
			'data' => $data,
			'timestamp' => (int) round( microtime( true ) * 1000 ),
			'hypothesisId' => $hypothesis_id,
		] );

		if ( ! $payload ) {
			return;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Practical MCP debugging.
		error_log( '[Elementor MCP build-composition] ' . $location . ': ' . $message . ' ' . $payload );

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents -- Debug session instrumentation.
		file_put_contents(
			ELEMENTOR_PATH . '.cursor/debug-518cfe.log',
			$payload . PHP_EOL,
			FILE_APPEND | LOCK_EX
		);
	}

	private function resolve_force_key_for_llm_adjust( ?Prop_Type $prop_type ): ?string {
		if ( ! $prop_type || $prop_type instanceof Union_Prop_Type ) {
			return null;
		}

		return $prop_type::get_key();
	}

	private function resolve_primary_static_type_key( ?Prop_Type $prop_type ): ?string {
		if ( ! $prop_type ) {
			return null;
		}

		if ( $prop_type instanceof Union_Prop_Type ) {
			$member_keys = array_keys( $prop_type->get_prop_types() );
			$static_keys = array_values(
				array_filter(
					$member_keys,
					fn( $key ) => 'dynamic' !== $key
				)
			);

			return $static_keys[0] ?? null;
		}

		return $prop_type::get_key();
	}

	private function format_expected_envelope_hint( ?Prop_Type $prop_type, string $element_type ): string {
		$type_key = $this->resolve_primary_static_type_key( $prop_type );

		if ( $type_key ) {
			return sprintf(
				'Send { "$$type": "%s", "value": <your value> }. See elementor://widgets/schema/%s.',
				$type_key,
				$element_type
			);
		}

		return sprintf(
			'Send a PropValue envelope with $$type from elementor://widgets/schema/%s.',
			$element_type
		);
	}

	private function summarize_subtree_for_debug( array $node ): array {
		return [
			'elType' => $node['elType'] ?? null,
			'widgetType' => $node['widgetType'] ?? null,
			'settings_keys' => array_keys( $node['settings'] ?? [] ),
			'settings_summary' => $this->summarize_settings_for_debug( $node['settings'] ?? [] ),
			'styles_count' => count( $node['styles'] ?? [] ),
			'children_count' => count( $node['elements'] ?? [] ),
		];
	}

	private function summarize_settings_for_debug( array $settings ): array {
		$summary = [];

		foreach ( $settings as $key => $value ) {
			$summary[ $key ] = $this->summarize_prop_value_for_debug( $value );
		}

		return $summary;
	}

	private function summarize_prop_value_for_debug( $value ): array {
		if ( is_scalar( $value ) ) {
			return [
				'kind' => 'scalar',
				'value' => is_string( $value ) ? mb_substr( (string) $value, 0, 120 ) : $value,
			];
		}

		if ( ! is_array( $value ) ) {
			return [
				'kind' => gettype( $value ),
			];
		}

		if ( array_is_list( $value ) ) {
			return [
				'kind' => 'list',
				'count' => count( $value ),
			];
		}

		$summary = [
			'kind' => 'object',
			'type' => $value['$$type'] ?? null,
		];

		if ( array_key_exists( 'value', $value ) ) {
			$inner = $value['value'];

			if ( is_scalar( $inner ) ) {
				$summary['value'] = is_string( $inner ) ? mb_substr( (string) $inner, 0, 120 ) : $inner;
			} elseif ( is_array( $inner ) ) {
				$summary['value_keys'] = array_keys( $inner );
			} else {
				$summary['value_kind'] = gettype( $inner );
			}
		}

		return $summary;
	}

	private function summarize_persisted_node( array $tree, string $root_id ): ?array {
		if ( '' === $root_id ) {
			return null;
		}

		$node = $this->find_persisted_subtree( $tree, 'document', $root_id );
		if ( ! $node ) {
			return null;
		}

		return $this->summarize_subtree_for_debug( $node );
	}

	private function save_to_draft( Document $document, array $elements ) {
		if ( 'publish' === get_post_status( $document->get_main_id() ) ) {
			wp_update_post( [
				'ID' => $document->get_main_id(),
				'post_status' => 'draft',
			] );
		}

		return $document->save( [ 'elements' => $elements ] );
	}
}

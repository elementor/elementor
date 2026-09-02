<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Composition_Persister;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use Elementor\Modules\Mcp\Abilities\Utils\Composition_Compiler;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Composition_Ability extends Abstract_Ability {

	const CONFIGURATION_ID_ATTRIBUTE = Xml_Parser::CONFIGURATION_ID_ATTRIBUTE;
	const DEFAULT_PARENT_ID = 'document';
	const MODE_APPEND = 'append';
	const MODE_REPLACE_CHILDREN = 'replace_children';

	private ?Document_Mutator $mutator;

	public function __construct( ?Document_Mutator $mutator = null ) {
		$this->mutator = $mutator;
	}

	protected function get_ability_id(): string {
		return 'elementor/build-composition';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Build Composition', 'elementor' ),
			$this->get_ability_description(),
			'elementor',
			$this->get_output_schema(),
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			$this->get_input_schema()
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$validation_error = $this->validate_input( $input );
		if ( $validation_error ) {
			return $validation_error;
		}

		$post_id = (int) $input['post_id'];
		$parent_id = $input['parent_id'] ?? self::DEFAULT_PARENT_ID;
		$dry_run = ! empty( $input['dry_run'] );
		$mode = $input['mode'] ?? self::MODE_APPEND;

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

		$elements_data = $document->get_elements_data();
		$compiled = Composition_Compiler::make()->compile(
			$input,
			$document,
			is_array( $elements_data ) ? $elements_data : [],
			$parent_id
		);
		if ( is_wp_error( $compiled ) ) {
			return $compiled;
		}

		$subtrees = $compiled['elements'];
		$warnings = $compiled['warnings'];
		$dom = $compiled['dom'];
		$xml_parser = $compiled['xml_parser'];

		if ( $dry_run ) {
			return $this->build_response( $post_id, $document, $xml_parser, $dom, [], $warnings, $mode, [] );
		}

		$persister = new Composition_Persister( $this->get_mutator(), $xml_parser );
		$persisted = $persister->insert_and_save( $document, $subtrees, $parent_id, $mode );
		if ( is_wp_error( $persisted ) ) {
			return $persisted;
		}

		$persister->embed_ids_into_dom( $dom, $persisted['tree'], $parent_id, $persisted['root_ids'] );

		return $this->build_response( $post_id, $document, $xml_parser, $dom, $persisted['root_ids'], $warnings, $mode, $persisted['removed_ids'] );
	}

	private function get_ability_description(): string {
		return $this->runtime_flags_notice() . Prompt_Loader::load( 'build-composition' );
	}

	/**
	 * When the V4 atomic experiment is off, the global-variables / global-classes / interactions
	 * tools and resources are not registered on this site — but the static doc still references
	 * them. Prepend a runtime notice so the LLM knows not to call them.
	 */
	private function runtime_flags_notice(): string {
		if ( AtomicWidgetsModule::is_active() ) {
			return '';
		}

		return "# THIS SITE IS V3-ONLY (V4 atomic experiment: OFF)\n\n"
			. "**This notice OVERRIDES anything below that references V4 widgets, global classes, global variables, interactions, or components. Wherever the sections below tell you to read `elementor://global-classes` / `elementor://global-variables` / `elementor://interactions/schema`, or to call `elementor/manage-classes` / `elementor/manage-global-variable` / `elementor/manage-default-styles` / `elementor/manage-component` / `elementor/reorder-classes`, ignore those instructions — those tools/resources are not registered on this site.**\n\n"
			. "## What IS available\n\n"
			. "- Widgets: whatever `elementor/list-widget-schemas` returns. Layout box is the V3 `container` element (use it wherever the sections below say `e-div-block` or `e-flexbox`).\n"
			. "- Abilities: `elementor/list-widget-schemas`, `elementor/get-widget-schema`, `elementor/get-page-structure`, `elementor/build-composition`, `elementor/manage-elements`, `elementor/create-page`, `elementor/update-page-settings`, `elementor/publish-document`, `elementor/create-preview-link`, `elementor/list-posts`, `elementor/list-assets`, `elementor/list-site-parts`, `elementor/manage-site-parts`.\n"
			. "- Resources: `elementor://style/best-practices`, `elementor://wordpress/best-practices`, `elementor://dynamic-tags`.\n\n"
			. "## Type mapping (V4 name → V3 name)\n\n"
			. "`e-heading` → `heading` · `e-paragraph` → `text-editor` · `e-image` → `image` · `e-button` → `button` · `e-svg` / `e-icon` → `icon` · `e-divider` → `divider` · `e-div-block` / `e-flexbox` → `container` (the V3 container is flex by default; set `container_type: grid` in style CSS via `display: grid` if you need grid).\n\n"
			. "## V3 style contract in one line\n\n"
			. "`element_config` = content/behavior only (see `properties` in the widget schema). `style` = CSS on the wrapper by default; when the widget schema exposes `inner_elements`, use `alias { … }` blocks per sub-part (identical to how `nav-menu` / `search` / `accordion` are documented). Wrappers accept regular CSS; the mapper routes what it can to native V3 controls and dumps the rest to `custom_css` (a Pro feature — expect a warning if Pro is not active). Common properties that map natively on the V3 `container`: `background-color`, `padding`, `margin`, `flex-direction`, `flex-wrap`, `justify-content`, `align-items`, `align-content`, `gap`, `min-height`, `max-width` (routes to boxed content), `border`, `border-{top,right,bottom,left}`, `border-radius`, `overflow`, `position`, `z-index`, `flex-grow`, `flex-shrink`, `align-self`, `order`. Motion and transforms fall to `custom_css`; animation properties are dropped.\n\n"
			. "## V3 container centering & sizing pitfalls\n\n"
			. "- **Do NOT write `margin: 0 auto` / `margin-left: auto; margin-right: auto`.** A V3 `container` centers its own content automatically when `max-width` is set — write `max-width: X` alone (routes to `boxed_width` + `content_width: boxed`). Writing `auto` on a numeric margin control falls to `custom_css`.\n"
			. "- **`min-width` is not a native V3 container control.** Use `flex-basis` or a min-width child pattern; a bare `min-width: X` falls to `custom_css`.\n"
			. "- **Hover transforms (`&:hover { transform: … }`) are custom_css.** V3 has no native micro-motion; expect a warning per widget.\n\n"
			. "## V3 container grid layouts\n\n"
			. "- To use grid, write **`grid-template-columns` (and/or `grid-template-rows`)** on the container — the mapper flips `container_type` to `grid` automatically. Writing bare `display: grid` also works but is not required if a grid-template is present. Values are passed through verbatim: `repeat(3, 1fr)`, `1fr 2fr 1fr`, `minmax(200px, 1fr)`, etc.\n"
			. "- `gap`, `align-items`, `justify-content`, `align-content` are written to BOTH the flex and grid twin settings, so the same CSS works whether the container is flex or grid.\n"
			. "- `grid-auto-flow` (`row`, `column`) and `justify-items` also route to native controls.\n\n"
			. "## custom_css visibility & Pro requirement\n\n"
			. "- Whatever the mapper cannot route falls to the widget's V3 `custom_css` setting **only when Elementor Pro is active** — `custom_css` is a Pro control. Without Pro, the write is skipped and a warning is emitted; do NOT retry the same `style` field, either fall back to `element_config`-only edits or ask the user to install Pro.\n"
			. "- When Pro is active, the custom_css lives under **Advanced → Custom CSS** on the widget's panel; its scope is the widget's own wrapper (V3 uses `selector` as the placeholder, which the mapper injects automatically).\n\n"
			. "---\n\n";
	}

	private function get_output_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'success', 'post_id', 'root_element_ids', 'edit_url', 'version' ],
			'properties' => [
				'success' => [ 'type' => 'boolean' ],
				'post_id' => [ 'type' => 'integer' ],
				'root_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'IDs of the created root-level elements.',
				],
				'edit_url' => [
					'type' => 'string',
					'format' => 'uri',
					'description' => 'Elementor editor URL for the document. Share with the user when they need a link (they must be logged into WordPress as an editor).',
				],
				'version' => [ 'type' => 'string' ],
				'resolved_xml' => [
					'type' => 'string',
					'description' => 'The XML with element IDs embedded.',
				],
				'warnings' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Non-fatal notices, e.g. props skipped because the target widget does not support them, or CSS that fell back to custom_css. The composition was still built.',
				],
				'removed_element_ids' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
					'description' => 'Element IDs removed when mode is replace_children (empty when none existed).',
				],
			],
		];
	}

	private function get_input_schema(): array {
		return [
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
					'description' => 'Record mapping configuration-id → plain widget settings matching elementor://widgets/schema/{type}. Keys MUST match configuration-id attributes in xml_structure. For <e-component> configuration-ids, the value is { component_id: int, overrides?: {<override_key>: <plain value>} } — see elementor/list-components.',
				],
				'style' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → plain CSS string. Supports &:hover/&:focus/&:active nesting and @media(--breakpoint) blocks. Keys MUST match configuration-id attributes in xml_structure.',
					'additionalProperties' => [ 'type' => 'string' ],
				],
				'classes' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → global class labels. Value is either an array of labels (attached to the element wrapper) or an object keyed by target (wrapper or an inner-element alias declared in the V3 widget map) with an array of labels per target. Create classes first via elementor/manage-classes.',
					'additionalProperties' => [
						'type' => [ 'array', 'object' ],
					],
				],
				'interactions' => [
					'type' => 'object',
					'default' => (object) [],
					'description' => 'Record mapping configuration-id → array of interaction items in the native shape. Read elementor://interactions/schema for the full shape and allowed enum values. Send [] for a configuration-id to clear its interactions.',
					'additionalProperties' => [
						'type' => 'array',
						'items' => [ 'type' => 'object' ],
					],
				],
				'parent_id' => [
					'type' => 'string',
					'default' => self::DEFAULT_PARENT_ID,
					'description' => 'ID of the parent container. Omit to insert at document root.',
				],
				'dry_run' => [
					'type' => 'boolean',
					'default' => false,
					'description' => 'If true, validate and return resolved tree without persisting.',
				],
				'mode' => [
					'type' => 'string',
					'enum' => [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ],
					'default' => self::MODE_APPEND,
					'description' => 'append (default) inserts under parent_id; replace_children removes existing direct children of parent_id first, then inserts.',
				],
			],
		];
	}

	private function validate_input( array $input ): ?\WP_Error {
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

		$mode = $input['mode'] ?? self::MODE_APPEND;
		$valid_modes = [ self::MODE_APPEND, self::MODE_REPLACE_CHILDREN ];
		if ( ! in_array( $mode, $valid_modes, true ) ) {
			return new \WP_Error(
				'invalid_input',
				sprintf(
					/* translators: 1: Provided mode value, 2: List of valid modes */
					__( 'Invalid mode "%1$s". Must be one of: %2$s', 'elementor' ),
					$mode,
					implode( ', ', $valid_modes )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function resolve_document( int $post_id ) {
		$document = Plugin::$instance->documents->get_doc_or_auto_save( $post_id, get_current_user_id() )
			?? Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'elementor_not_found',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $document;
	}

	private function build_response(
		int $post_id,
		Document $document,
		Xml_Parser $xml_parser,
		\DOMDocument $dom,
		array $root_ids,
		array $warnings,
		string $mode,
		array $removed_ids
	): array {
		$post = get_post( $post_id );

		$response = [
			'success' => true,
			'post_id' => $post_id,
			'root_element_ids' => $root_ids,
			'edit_url' => $document->get_edit_url(),
			'version' => $post ? $post->post_modified_gmt : current_time( 'mysql', true ),
			'resolved_xml' => $xml_parser->serialize_children( $dom ),
		];

		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		if ( self::MODE_REPLACE_CHILDREN === $mode ) {
			$response['removed_element_ids'] = $removed_ids;
		}

		return $response;
	}

	private function get_mutator(): Document_Mutator {
		return $this->mutator ?? Document_Mutator::instance();
	}
}

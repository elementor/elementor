<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Post_Ability extends Abstract_Ability {

	private const OPERATIONS = [
		'create' => [ Post\Create_Post_Operation::class ],
		'update' => [ Post\Update_Post_Operation::class ],
		'replace_content' => [ Post\Content_Mutation_Operation::class, 'replace' ],
		'append_content' => [ Post\Content_Mutation_Operation::class, 'append' ],
		'update_element' => [ Post\Element_Mutation_Operation::class, 'update' ],
		'add_classes' => [ Post\Element_Mutation_Operation::class, 'add_classes' ],
		'remove_classes' => [ Post\Element_Mutation_Operation::class, 'remove_classes' ],
		'trash' => [ Post\Lifecycle_Operation::class, 'trash' ],
		'restore' => [ Post\Lifecycle_Operation::class, 'restore' ],
		'delete' => [ Post\Lifecycle_Operation::class, 'delete' ],
	];

	private const DRY_RUN_OPERATIONS = [ 'create', 'replace_content', 'append_content' ];

	private function ability_description(): string {
		return __(
			'Create, update, trash, restore, delete, or write content for an Elementor v4 post in a single call. Operations: create | update | replace_content | append_content | update_element | add_classes | remove_classes | trash | restore | delete. The `elements` field accepts plain JSON nodes ({ widget, text, tag, url, image_id, image_url, alt, size, svg_id, svg_url, svg_markup, css, states, classes, children }); $$type wrappers are never required from agents. Supported widgets: container | div | flexbox | heading | paragraph | button | image | svg. SVG nodes accept svg_id / svg_url, or svg_markup (inline <svg>…</svg> markup, which is sanitized and uploaded to the media library on save). Build global classes via elementor/manage-global-classes and reference them by id in classes:[]. PSEUDO-STATE styling: alongside `css` (the default state), pass a `states` map { hover, focus, active, focus-visible, checked, selected } where each value is CSS in the same format as `css`; each becomes a state variant on the element\'s local style (hover automatically also matches :focus-visible). Breakpoints are not part of this version. Root-level widgets without a container parent are auto-wrapped in an e-div-block; see the `normalized` field in the response for details. Element-scoped ops (update_element / add_classes / remove_classes) take element_id + small payload and patch one node in place; when the targeted post is the one open in the editor, the canvas updates surgically without a document reload.',
			'elementor'
		);
	}

	private function patch_field_description(): string {
		return __(
			'Surgical patch for update_element. Fields not listed are left untouched ($set semantics). Shape: { text?, tag?, url?, target_blank?, svg_id?, svg_url?, svg_markup?, link_url?, link_target_blank?, css?, states?, classes? }. text is plain string (inline <br>/<strong> allowed). tag: h1..h6 for heading; any string for paragraph/button. url is for button link (sanitized). On an svg element: svg_id / svg_url / svg_markup replace the SVG source (resolved in that order; svg_markup is sanitized + sideloaded into the media library), and link_url / link_target_blank set the SVG link. css is a CSS declaration string OR an object map { "background-color":"red", "padding":"8px" }; merges prop-by-prop into the element\'s existing local style variant (existing props on the same variant are preserved). states is a map { hover, focus, active, focus-visible, checked, selected } → CSS (same format as css); each merges prop-by-prop into the matching pseudo-state variant of the element\'s local style (a state with no existing variant is created). classes is an array of global class ids; REPLACES the element\'s current class list (use add_classes / remove_classes ops for union/filter semantics). The local-style class e-<id>-s is automatically maintained when CSS is patched.',
			'elementor'
		);
	}

	private function elements_field_description(): string {
		return __(
			'Plain JSON nodes. Each node: { widget, text?, tag?, link_url?, link_target_blank?, image_id?, image_url?, alt?, size?, svg_id?, svg_url?, svg_markup?, css?, states?, classes?, children? }. widget: "container" | "div" | "heading" | "paragraph" | "button" | "image" | "svg". text is plain string (inline <br>/<strong> allowed). LINK on button + image + svg: link_url (where a click goes, sanitized to http|https|mailto|tel|#anchor|/relative) and link_target_blank (boolean, open in new tab). SVG source (svg widget) — all optional, resolved in order svg_id → svg_url → svg_markup: svg_id (positive int WP attachment id; it is validated to be an image/svg+xml attachment — a missing id or non-SVG mime is rejected with a svg_id_invalid_mime warning and the default SVG is used), svg_url (http/https to an .svg), svg_markup (inline <svg>…</svg> string — sanitized via Elementor\'s SVG sanitizer and sideloaded into the media library on save, then referenced by the new attachment id; identical markup is deduplicated to a single attachment by content hash). Aliases on svg: attachment_id, media_id (for svg_id); src (for svg_url); svg_content, svg_inline (for svg_markup). On an svg node, alt only titles the inline upload — e-svg has no alt/accessibility prop. When no svg source resolves, Elementor\'s default SVG is used; on dry_run inline svg_markup is NOT uploaded (a warnings[] entry notes it will upload on a real save). NOTE: a bare `url` / `target_blank` field is no longer accepted on button, image, or svg nodes — it is ignored and a warnings[] entry is returned telling you to rename. IMAGE source (what is displayed) is separate from image link — all source fields are optional: pass image_id (positive int WP attachment id, preferred) or image_url (http/https). Aliases accepted on image: attachment_id, media_id, numeric id (treated as attachment id; on non-image widgets only string id is the element id) for image_id; src for image_url. When no source key resolves, the Elementor placeholder image is used; if any source key was present but none resolved, a warnings[] entry is returned naming the path + keys. Optional alt; size is a WP image size slug (default "full"). css is a semicolon-separated declaration string converted to typed style props; declarations that cannot be converted fall back to custom_css. states is a map of pseudo-state → CSS (same format as css): { hover, focus, active, focus-visible, checked, selected }; each renders as a state variant (e.g. :hover, :focus) on the element\'s local style — hover also matches :focus-visible. Unsupported state keys are ignored with an invalid_state warning. Response field css_via_custom_css = those declarations ARE rendering (Pro + atomic-custom-css active, no action needed). Response field css_not_rendered = those declarations will NOT render on the published page (Pro not active; see the warning field for details). classes is an array of global class ids (get them from elementor/manage-global-classes). children is recursive for containers. Raw v4 nodes ({elType, widgetType, settings.* with $$type}) are also accepted for backwards compatibility. Required for replace_content/append_content; optional on create. At the document root, every widget must have a container parent; loose root widgets are auto-wrapped in an e-div-block (consecutive widgets are grouped into one wrapper).',
			'elementor'
		);
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-post';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Post', 'elementor' ),
			$this->ability_description(),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'operation' => [ 'type' => 'string' ],
					'post_id' => [ 'type' => 'integer' ],
					'post_type' => [ 'type' => 'string' ],
					'post_status' => [ 'type' => 'string' ],
					'edit_url' => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'dry_run' => [ 'type' => 'boolean' ],
					'added' => [ 'type' => 'integer' ],
					'deleted' => [ 'type' => 'boolean' ],
					'css_via_custom_css' => [ 'type' => 'array', 'description' => 'CSS declarations that could not be converted to typed style props but ARE rendered via custom_css (Elementor Pro atomic-custom-css is active). No action needed.' ],
					'css_not_rendered' => [ 'type' => 'array', 'description' => 'CSS declarations that could not be converted to typed style props and WILL NOT render — Elementor Pro atomic-custom-css is not active. These declarations are stored but invisible on the published page. Action needed.' ],
					'warning' => [ 'type' => 'string', 'description' => 'Present only when css_not_rendered is non-empty. Describes the rendering gap and what to do.' ],
					'normalized' => [ 'type' => 'array' ],
					'warnings' => [ 'type' => 'array', 'description' => 'Soft, non-blocking signals from the resolver. Each entry: { reason, path, keys?, hint? }. Reasons: image_source_unresolved (image source keys were present but none resolved — Elementor placeholder used); legacy_link_keys_ignored (url / target_blank were present on a button/image — they are no longer accepted; use link_url / link_target_blank); svg_source_unresolved (svg source keys were present but none resolved — default SVG used); svg_id_invalid_mime (svg_id was not an image/svg+xml attachment — default SVG used); svg_inline_upload_skipped_dry_run (inline svg_markup is not uploaded on dry_run — re-run without dry_run); svg_inline_upload_failed (inline svg_markup could not be sanitized/uploaded — default SVG used).' ],
					'preview' => [ 'type' => 'string', 'description' => 'Present on dry_run only. Indented ASCII outline of the resolved element tree (widget types, truncated text/url/classes) so the result can be sanity-checked before saving.' ],
					'element_id' => [ 'type' => 'string', 'description' => 'Echoed for element-scoped ops (update_element / add_classes / remove_classes).' ],
					'patched_element' => [ 'type' => 'object', 'description' => 'Authoritative server view of the patched node after save. JS clients should trust this over their local input.' ],
					'changed_settings_keys' => [ 'type' => 'array', 'description' => 'For update_element: the keys in settings that were modified by the patch. Helps clients dispatch the minimal in-place UI update.' ],
					'style_id' => [ 'type' => 'string', 'description' => 'For update_element with css: the local-style id (e-<element_id>-s) that was patched.' ],
					'classes' => [ 'type' => 'array', 'description' => 'For add_classes / remove_classes: the resulting full class list on the element.' ],
					'element_index' => [ 'type' => 'object', 'description' => 'Present on create / replace_content / append_content (real saves, not dry_run). Map of structural path to the saved element id for the nodes just written — e.g. { "elements[0]": "ab12cd", "elements[0].elements[1]": "2b403e90" } — INCLUDING any wrapper containers auto-inserted by normalization. Use these ids directly with update_element / add_classes / remove_classes; no follow-up elementor/get-post is needed. On append_content only the appended nodes are indexed.' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'show_in_rest' => true,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'properties' => [
					'operation' => [
						'type' => 'string',
						'enum' => array_keys( self::OPERATIONS ),
						'description' => 'Which lifecycle action to take.',
					],
					'post_id' => [
						'type' => 'integer',
						'description' => 'Target post. Required for every operation except create.',
					],
					'title' => [
						'type' => 'string',
						'description' => 'Post title. Required for create.',
					],
					'post_type' => [
						'type' => 'string',
						'description' => 'Post type slug. Only honored on create. Default: page. Must support Elementor.',
					],
					'post_status' => [
						'type' => 'string',
						'description' => 'draft | publish | private (or any registered status). Default on create: draft. Transitioning to publish requires publish_post capability.',
					],
					'slug' => [
						'type' => 'string',
						'description' => 'Post name; WordPress sanitizes and de-duplicates.',
					],
					'post_template' => [
						'type' => 'string',
						'description' => 'Page template slug. New-post default: elementor_canvas. Pass an empty string to use the theme default. On update, only changed when explicitly provided.',
					],
					'elements' => [
						'type' => 'array',
						'description' => $this->elements_field_description(),
					],
					'element_id' => [
						'type' => 'string',
						'description' => 'Required for update_element / add_classes / remove_classes. The id of the element to patch (find it via elementor/get-post or in the canvas).',
					],
					'patch' => [
						'type' => 'object',
						'description' => $this->patch_field_description(),
					],
					'classes' => [
						'type' => 'array',
						'description' => 'Required for add_classes / remove_classes. Array of global class ids. add_classes unions with existing; remove_classes filters them out (the local-style class e-<id>-s is always preserved on remove).',
					],
					'dry_run' => [
						'type' => 'boolean',
						'description' => 'When true, do not write. Only honored when elements is supplied.',
					],
				],
				'required' => [ 'operation' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$operation = isset( $input['operation'] ) ? (string) $input['operation'] : '';

		if ( ! isset( self::OPERATIONS[ $operation ] ) ) {
			return new \WP_Error(
				'invalid_operation',
				sprintf(
					/* translators: %s: comma-separated list of allowed operations. */
					__( 'Operation must be one of: %s.', 'elementor' ),
					implode( ', ', array_keys( self::OPERATIONS ) )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! empty( $input['dry_run'] ) && ! in_array( $operation, self::DRY_RUN_OPERATIONS, true ) ) {
			return new \WP_Error(
				'dry_run_not_supported',
				sprintf(
					/* translators: %s: comma-separated list of operations that accept dry_run. */
					__( 'dry_run is only honored on operations that accept elements: %s.', 'elementor' ),
					implode( ', ', self::DRY_RUN_OPERATIONS )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$entry = self::OPERATIONS[ $operation ];
		$class = $entry[0];
		$mode = $entry[1] ?? null;

		$handler = null === $mode ? new $class() : new $class( $mode );

		return $handler->handle( $input );
	}
}

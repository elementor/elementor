<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Set_Post_Content_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/set-post-content';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Set Post Content',
			'description' => 'Writes the Elementor elements tree to a post. Handles wp_slash, cache clearing, and CSS regeneration automatically.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to update.',
					],
					'elements' => [
						'type'        => 'array',
						'description' => 'Full Elementor elements tree to save. Must be the complete top-level array (not a diff).',
					],
				],
				'required'             => [ 'post_id', 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'success' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Saves a full Elementor elements tree to a post.',
						'Always pass the complete elements array — this is a full replacement, not a merge.',
						'Use elementor/get-post-content first to read current content, then modify and pass back.',
						'wp_slash, JSON encoding, CSS cache clearing, and post plain-text regeneration are handled internally.',
						'Each element requires at minimum: id (unique string), elType (e.g. "widget"), settings (object).',
						'For atomic (v4) widgets also include: widgetType, styles (keyed by style ID).',
						'PROP FORMAT: ALL typed prop values use $$type (double dollar sign), never $type. Example: {"$$type":"classes","value":["e-gc-..."]}. Single-dollar $type will be rejected with an error.',
						'WIDGET PROP KEYS (the settings key that holds the main content):',
						'  e-heading   → title:     {$$type:"html-v3", value:{content:{$$type:"string",value:"..."}, children:[]}}',
						'  e-paragraph → paragraph: {$$type:"html-v3", ...}',
						'  e-button    → text:      {$$type:"html-v3", ...}',
						'  e-image     → image:     optional — omit to rely on class-based styling',
						'  Run elementor/widget-schema for any other widget type before first use.',
						'CLASS IDs: classes.value must contain the FULL UUID returned by set-global-classes, e.g. "e-gc-9705bfbc-2335-4e75-b761-71e4973977df". Truncated IDs (e.g. "e-gc-9705bfbc") silently save but render no styles and will now be rejected. You may also pass the human-readable label (e.g. "ajax-hero-outer") — it will be resolved to the full ID internally.',
						'ELEMENT TYPES:',
						'  e-flexbox → container/row/column. Uses elType:"e-flexbox", has an "elements" children array, NO widgetType. Do NOT call widget-schema for e-flexbox.',
						'  widget    → leaf element. Uses elType:"widget" + widgetType (e.g. "e-heading"). Has no children elements array.',
						'CLASSES PROP FORMAT — classes.value is a plain array of strings (not objects):',
						'  {"$$type":"classes","value":["e-gc-9705bfbc-2335-4e75-b761-71e4973977df"]}',
						'  Each string is a global class UUID, a local style ID from element.styles, or a human-readable label (resolved automatically).',
						'LOCAL STYLES FORMAT — element.styles is a keyed object (not an array):',
						'  "styles": { "<style-id>": { "type":"class", "label":"local", "variants": [{ "meta": { "breakpoint":null, "state":null }, "props": {...} }] } }',
						'  style-id: any short unique string (e.g. "s1", "e-dh-s-abc"). Must also appear in settings classes.value to have any effect.',
						'  meta.breakpoint: null = all breakpoints, or a breakpoint key (e.g. "mobile").',
						'  meta.state: null = default state. Use "hover" or "focus" for interactive states. Empty string "" and "normal" are invalid.',
						'COMMON CLASS PROP FORMATS (for global class variant props):',
						'  Solid background: {"$$type":"background","value":{"background-overlay":{"$$type":"background-overlay","value":[{"$$type":"background-color-overlay","value":{"color":{"$$type":"color","value":"#ffffff"}}}]}}}',
						'  Padding/margin:   {"$$type":"linked-dimensions","value":{"top":{"$$type":"size","value":{"size":80,"unit":"px"}},"right":{...},"bottom":{...},"left":{...}}}',
						'  Font size:        {"$$type":"size","value":{"size":16,"unit":"px"}}  — NOT a plain string like "16px"',
						'  Color:            {"$$type":"color","value":"#333333"}',
						'  Width %:          {"$$type":"size","value":{"size":50,"unit":"%"}}',
						'For new pages, prefer elementor/build-page — creates variables, classes, and elements atomically in one call.',
						'For existing pages: use get-post-content → modify → set-post-content.',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id  = (int) $input['post_id'];
		$elements = $input['elements'];

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$repo        = new Global_Classes_Repository();
		$all_classes = $repo->all()->get_items()->all();

		$label_to_id = [];
		$known_ids   = [];
		foreach ( $all_classes as $id => $item ) {
			$known_ids[]                         = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$this->resolve_class_labels( $elements, $label_to_id );
		$this->normalize_element_styles( $elements );
		$this->auto_mirror_style_keys_into_classes( $elements );

		$local_ids = [];
		$this->collect_local_style_ids( $elements, $local_ids );

		$errors = [];
		$this->validate_elements( $elements, array_merge( $known_ids, $local_ids ), $errors );
		$this->coerce_style_props( $elements );
		$this->validate_widget_settings( $elements, $errors );
		$style_errors = $this->validate_element_styles( $elements );
		$all_errors   = array_values( array_merge( $errors, $style_errors ) );

		if ( ! empty( $all_errors ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'set-post-content validation failed:' . "\n - " . implode( "\n - ", $all_errors ) );
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id' => $post_id,
			'success' => (bool) $saved,
		];
	}
}

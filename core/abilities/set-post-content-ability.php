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
			$known_ids[]                            = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$this->resolve_class_labels( $elements, $label_to_id );
		$this->validate_elements( $elements, $known_ids );

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id' => $post_id,
			'success' => (bool) $saved,
		];
	}

}

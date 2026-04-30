<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Append_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/append-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Append Element',
			'description' => 'Appends a single element to a post without requiring a full read-modify-write cycle. Faster than get-post-content + set-post-content for simple insertions.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
					'element' => [
						'type'        => 'object',
						'description' => 'Element object to append. Must include: id (unique string), elType, settings. For widgets: widgetType. For containers: elements (children array).',
					],
					'parent_id' => [
						'type'        => [ 'string', 'null' ],
						'description' => 'ID of the parent element to append into. null or omitted = append to the root of the document.',
					],
				],
				'required'             => [ 'post_id', 'element' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'      => [ 'type' => 'integer' ],
					'appended_id'  => [
						'type'        => 'string',
						'description' => 'id of the appended element.',
					],
					'parent_id'    => [ 'type' => [ 'string', 'null' ] ],
					'success'      => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Appends one element to a post without fetching the full content first.',
						'Use this for simple insertions instead of get-post-content + set-post-content.',
						'For building a complete page from scratch, use elementor/build-page with the full element tree — it is one write vs N reads + N writes when called in a loop.',
						'parent_id: ID of the container element to append into. Omit or pass null to append at root level.',
						'The element id must be unique within the document — generate one (e.g. a short random string).',
						'Returns success:false (does not throw) if parent_id is provided but not found in the tree.',
						'AUTO-FIXES: runs the same normalize pipeline as build-page — style.id, style.label, breakpoint defaults, and auto-mirror of element.styles keys into settings.classes.value. Pass styles in element.styles and they will be attached automatically.',
						'VALIDATION: all structural + widget-prop + style-prop errors are batched and thrown together — same as build-page.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id   = (int) $input['post_id'];
		$element   = $input['element'];
		$parent_id = $input['parent_id'] ?? null;

		// Auto-generate an id when the caller omits it — matches make-widget / make-page
		// and keeps `appended_id` non-null so the output schema validates.
		if ( ! isset( $element['id'] ) || ! is_string( $element['id'] ) || '' === $element['id'] ) {
			$element['id'] = Utils::generate_id();
		}

		// Bust the WP object cache so get_elements_data reads from DB, not a stale cache.
		wp_cache_delete( $post_id, 'post_meta' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];

		if ( null === $parent_id ) {
			$elements[] = $element;
			$found      = true;
		} else {
			$found = $this->append_to_parent( $elements, $parent_id, $element );
		}

		if ( ! $found ) {
			return [
				'post_id'     => $post_id,
				'appended_id' => $element['id'] ?? null,
				'parent_id'   => $parent_id,
				'success'     => false,
			];
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
			throw new \InvalidArgumentException( 'append-element validation failed:' . "\n - " . implode( "\n - ", $all_errors ) );
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'     => $post_id,
			'appended_id' => $element['id'] ?? null,
			'parent_id'   => $parent_id,
			'success'     => (bool) $saved,
		];
	}
}

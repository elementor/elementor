<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Appends one or more sections to an existing Elementor page from a friendly spec.
 *
 * Distinct from make-page, which replaces the full page content. Use edit-page when the
 * page already exists and you only want to add new top-level sections without touching
 * what is already there.
 */
class Edit_Page_Ability extends Abstract_Ability {

	use Page_Spec_Builder;

	protected function get_name(): string {
		return 'elementor/edit-page';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor Edit Page',
			'description'  => 'Appends one or more sections to an existing Elementor page from a friendly spec — without replacing existing content. Use make-page to replace the whole page.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [
					'post_id'  => [
						'type'        => 'integer',
						'description' => 'WordPress post ID of the existing page to edit.',
					],
					'sections' => [
						'type'        => 'array',
						'description' => 'Sections to append. Same spec format as make-page: each node is {widget, css_id?, css?, classes?, children?, text?, tag?, url?, attachment_id?}.',
					],
					'dry_run'  => [
						'type'        => 'boolean',
						'description' => 'When true, builds the new nodes and validates them without saving. Returns { success, dry_run:true, elements, errors[] }.',
					],
				],
				'required'             => [ 'post_id', 'sections' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'success'   => [ 'type' => 'boolean' ],
					'post_id'   => [ 'type' => 'integer' ],
					'added'     => [
						'type'        => 'integer',
						'description' => 'Number of top-level sections appended.',
					],
					'edit_url'  => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'dry_run'   => [ 'type' => 'boolean' ],
					'elements'  => [
						'type'        => 'array',
						'description' => 'Built element nodes (present when dry_run is true).',
					],
					'errors'    => [ 'type' => 'array' ],
					'warnings'  => [
						'type'        => 'array',
						'description' => 'Non-fatal issues resolved automatically (e.g. invalid heading tag defaulted to h2).',
					],
					'css_gaps'  => [
						'type'        => 'array',
						'description' => 'CSS declarations moved to custom_css. Each entry: { element_id, css_gaps[] }.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Appends sections to an existing page without touching its current content. For full-page replacement use elementor/make-page instead.',
						'SPEC SHAPE: identical to make-page — each node is { widget, css_id?, css?, classes?, children?, text?, tag?, url?, attachment_id? }.',
						'CONTAINER synonyms for `widget`: "container"|"flexbox"|"e-flexbox"|"section" → e-flexbox (flex, column by default); "div"|"div-block"|"e-div-block" → e-div-block (block). Containers have children[]. Override flex-direction in css when you need row layout.',
						'LEAF widgets for `widget`: "heading" → e-heading; "paragraph" → e-paragraph; "button" → e-button; "image" → e-image.',
						'BUTTON defaults: renders as <a> (pass tag:"button" for the semantic button element). When no css is provided, Elementor\'s base style applies — blue background (#375EFB), white text, 12px 24px padding, 2px border-radius, inline-block. Pass css to override any of these. url wires the href.',
						'css: CSS declaration string attached as a local style. classes: global class IDs or labels (resolved automatically).',
						'DRY_RUN: pass dry_run:true to build + validate the new nodes without saving.',
						'After appending, call elementor/force-clear-styles if you need the CSS regenerated immediately.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id  = (int) $input['post_id'];
		$sections = isset( $input['sections'] ) && is_array( $input['sections'] ) ? $input['sections'] : [];
		$dry_run  = ! empty( $input['dry_run'] );

		$this->reset_build_state();

		$spec_errors = [];
		foreach ( $sections as $i => $section ) {
			$this->validate_spec( $section, "sections[$i]", $spec_errors );
		}

		if ( ! empty( $spec_errors ) && $dry_run ) {
			return [
				'success'  => false,
				'post_id'  => $post_id,
				'dry_run'  => true,
				'errors'   => $spec_errors,
				'warnings' => $this->build_warnings,
			];
		}
		if ( ! empty( $spec_errors ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( 'edit-page spec validation failed:' . "\n - " . implode( "\n - ", $spec_errors ) );
		}

		$elements = [];
		foreach ( $sections as $section ) {
			$elements[] = $this->build_element( $section );
		}

		if ( $dry_run ) {
			$response = [
				'success'  => true,
				'post_id'  => $post_id,
				'dry_run'  => true,
				'elements' => $elements,
				'errors'   => [],
			];
			if ( ! empty( $this->build_warnings ) ) {
				$response['warnings'] = $this->build_warnings;
			}
			if ( ! empty( $this->element_css_gaps ) ) {
				$response['css_gaps'] = $this->element_css_gaps;
			}
			return $response;
		}

		$append_input = [
			'post_id'  => $post_id,
			'elements' => array_map( static fn( $el ) => [ 'element' => $el ], $elements ),
		];

		$result = ( new Append_Elements_Ability() )->execute( $append_input );

		$response = [
			'success'   => $result['success'],
			'post_id'   => $post_id,
			'added'     => count( $elements ),
			'edit_url'  => admin_url( "post.php?post={$post_id}&action=elementor" ),
			'permalink' => get_permalink( $post_id ) ? get_permalink( $post_id ) : null,
		];

		if ( ! empty( $this->build_warnings ) ) {
			$response['warnings'] = $this->build_warnings;
		}

		if ( ! empty( $this->element_css_gaps ) ) {
			$response['css_gaps'] = $this->element_css_gaps;
		}

		return $response;
	}
}

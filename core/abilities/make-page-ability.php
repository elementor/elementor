<?php

namespace Elementor\Core\Abilities;

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

	use Page_Spec_Builder;

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
						'description' => 'Top-level nodes. Each node is {widget, css_id?, css?, classes?, children?, text?, tag?, url?, attachment_id?}. Containers have children[]; leaves have text / tag / url / attachment_id as applicable. Use css_id to set the HTML id attribute (#selector / anchor).',
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
					'warnings'  => [
						'type'        => 'array',
						'description' => 'Non-fatal issues resolved automatically (e.g. invalid heading tag defaulted to h2).',
					],
					'css_gaps'  => [
						'type'        => 'array',
						'description' => 'CSS declarations that could not be converted to v4 props and were written to custom_css instead. Each entry: { element_id, css_gaps[] }.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Friendly spec → full Elementor v4 tree → save, in a single call. Delegates save to elementor/build-page so every normalize / auto-mirror / validate pass runs once on the built tree.',
						'POST CREATION: omit post_id and pass title (+ optional post_type/post_status/slug) to create a new WordPress post and build it in one call. Returns edit_url and permalink alongside the build result. For standalone post creation without content use wordpress/create-post.',
						'SPEC SHAPE — each node is { widget, css_id?, css?, classes?, children?, text?, tag?, url?, attachment_id? }. css_id sets the HTML id attribute (renders as id="..." in the DOM; targetable as #css_id in CSS and usable as a scroll anchor). Do NOT use the internal `id` field for this — it is a 7-hex widget key, not a CSS selector.',
						'CONTAINER synonyms for `widget`: "container"|"flexbox"|"e-flexbox"|"section" → e-flexbox (flex, column by default); "div"|"div-block"|"e-div-block" → e-div-block (block). Containers have children[]. Override flex-direction in css when you need row layout (e.g. side-by-side columns).',
						'LEAF widgets for `widget`: "heading" → e-heading; "paragraph" → e-paragraph; "button" → e-button; "image" → e-image. Leaves have text/tag/url/attachment_id as applicable.',
						'BUTTON defaults: renders as <a> (pass tag:"button" for the semantic button element). When no css is provided, Elementor\'s base style applies — blue background (#375EFB), white text, 12px 24px padding, 2px border-radius, inline-block. Pass css to override any of these. url wires the href.',
						'css: CSS declaration string. Converted via elementor/css-to-props and attached as a local style entry on that node. The auto-generated style id is mirrored into settings.classes.value.',
						'classes: array of global class IDs or labels. Resolved by build-page (label → ID).',
						'DRY_RUN: pass dry_run:true to build + validate without saving. Returns { success, dry_run:true, elements, errors[] }. Errors are aggregated across structural / widget-settings / style-prop validation.',
						'COMMON MISTAKES that produce actionable errors:',
						'  - widget_type: use `widget`, not `widget_type`.',
						'  - content: use `text`, not `content`, on leaf widgets.',
						'  - unknown widget name: did-you-mean suggestion via Levenshtein.',
						'  - heading with non h1-h6 tag: coerced to h2 with a warning in the response.',
						'`id` is always auto-generated — do not pass it. To set the HTML id attribute use css_id.',
						'CSS GAPS: CSS declarations that cannot be represented as typed v4 props (e.g. background: linear-gradient(…), background-clip: text, -webkit-text-fill-color: …, border: N px solid …, vendor-prefixed props) are automatically collected into the style variant\'s custom_css field (base64-encoded) instead of failing. The response includes a css_gaps list per element so you know what was moved.',
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

		$this->reset_build_state();

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
				'success'  => false,
				'post_id'  => $post_id,
				'dry_run'  => true,
				'errors'   => $spec_errors,
				'warnings' => $this->build_warnings,
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

		if ( ! empty( $this->build_warnings ) ) {
			$result['warnings'] = $this->build_warnings;
		}

		if ( ! empty( $this->element_css_gaps ) ) {
			$result['css_gaps'] = $this->element_css_gaps;
		}

		return $result;
	}
}

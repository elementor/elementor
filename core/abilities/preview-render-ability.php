<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\AtomicWidgets\Styles\Atomic_Widget_Styles;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render an Elementor post's builder content to HTML (+ optional CSS) for verification
 * right after a save. Collapses the 3-call get-post-content + curl-page + read-css flow
 * into a single round-trip.
 *
 * CSS NOTES: Elementor has two parallel CSS pipelines and the response splits them:
 *   - `css` — legacy (v1–v3) Post_CSS. Populated for posts that still use the legacy
 *     pipeline; for pure atomic (v4) pages it is typically empty or near-empty.
 *   - `atomic_css` — v4 local styles rendered via the Atomic_Styles_Manager renderer,
 *     one concatenated string with @media wrappers per non-default breakpoint. Does
 *     NOT include kit-level global classes or variables — those live in separate
 *     kit-scoped stylesheets that are stable across posts (fetch via v4-styles-reference
 *     if you need them).
 */
class Preview_Render_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/preview-render';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Preview Render',
			'description' => 'Renders an Elementor post to HTML (and optionally CSS) for post-save verification — no external HTTP needed.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to render.',
					],
					'with_css' => [
						'type'        => 'boolean',
						'description' => 'Include both `css` (legacy Post_CSS) and `atomic_css` (v4 local styles) in the response. Default: false.',
					],
				],
				'required'             => [ 'post_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'    => [ 'type' => 'integer' ],
					'html'       => [ 'type' => 'string' ],
					'css'        => [
						'type'        => 'string',
						'description' => 'Legacy (v1–v3) Post_CSS. Typically empty for pure atomic (v4) posts. Use `atomic_css` for v4 local styles.',
					],
					'atomic_css' => [
						'type'        => 'string',
						'description' => 'v4 atomic local styles for this post, concatenated across breakpoints with @media wrappers. Does NOT include kit-level global classes or variables.',
					],
					'is_built_with_elementor' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Renders the post\'s Elementor content to HTML via Elementor\'s frontend pipeline.',
						'Use after build-page / set-post-content to verify the save took effect without having to fetch the live URL.',
						'Pass with_css=true to also receive both CSS layers:',
						'  - `css`        → legacy (v1–v3) Post_CSS. Usually empty for pure atomic (v4) pages.',
						'  - `atomic_css` → v4 local styles (element-scoped) rendered via Atomic_Styles_Manager, concatenated across breakpoints with @media wrappers.',
						'`atomic_css` does NOT include kit-level global classes or CSS variables — those are written to separate kit-scoped stylesheets that are stable across posts. Fetch the v4-styles-reference ability if you need those.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id  = (int) $input['post_id'];
		$with_css = ! empty( $input['with_css'] );

		$document = Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$is_built = $document->is_built_with_elementor();

		$html = '';
		try {
			$html = (string) Plugin::$instance->frontend->get_builder_content( $post_id, false );
		} catch ( \Throwable $e ) {
			$html = '';
		}

		$css        = '';
		$atomic_css = '';

		if ( $with_css && $is_built ) {
			try {
				$post_css = \Elementor\Core\Files\CSS\Post::create( $post_id );
				$post_css->update();
				$css = (string) $post_css->get_content();
			} catch ( \Throwable $e ) {
				$css = '';
			}

			try {
				$atomic_css = $this->render_atomic_local_css( $document );
			} catch ( \Throwable $e ) {
				$atomic_css = '';
			}
		}

		return [
			'post_id'                 => $post_id,
			'html'                    => $html,
			'css'                     => $css,
			'atomic_css'              => $atomic_css,
			'is_built_with_elementor' => (bool) $is_built,
		];
	}

	/**
	 * Render the post's atomic (v4) local styles to a single CSS string. Styles_Renderer
	 * wraps each non-default-breakpoint variant in its own @media query, so we can pass
	 * the full style list in one call instead of grouping by breakpoint up front.
	 */
	private function render_atomic_local_css( $document ): string {
		$elements = $document->get_elements_data();
		$elements = is_array( $elements ) ? $elements : [];
		if ( empty( $elements ) ) {
			return '';
		}

		$styles = [];
		$this->collect_atomic_styles( $elements, $styles );
		if ( empty( $styles ) ) {
			return '';
		}

		$styles             = Atomic_Widget_Styles::get_license_based_filtered_styles( $styles );
		$breakpoints_config = Plugin::$instance->breakpoints->get_breakpoints_config();

		return (string) Styles_Renderer::make( $breakpoints_config )->render( array_values( $styles ) );
	}

	/**
	 * Recursively collect inline element styles from the tree for atomic widgets
	 * / containers. Non-atomic (legacy) elements are skipped.
	 */
	private function collect_atomic_styles( array $elements, array &$out ): void {
		foreach ( $elements as $el ) {
			if ( ! empty( $el['styles'] ) && is_array( $el['styles'] ) ) {
				foreach ( $el['styles'] as $style ) {
					if ( is_array( $style ) ) {
						$out[] = $style;
					}
				}
			}
			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				$this->collect_atomic_styles( $el['elements'], $out );
			}
		}
	}
}

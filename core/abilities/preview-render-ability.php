<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render an Elementor post's builder content to HTML (+ optional CSS) for verification
 * right after a save. Collapses the 3-call get-post-content + curl-page + read-css flow
 * into a single round-trip.
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
						'description' => 'Include the post\'s inline CSS in the response. Default: false.',
					],
				],
				'required'             => [ 'post_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'html'    => [ 'type' => 'string' ],
					'css'     => [ 'type' => 'string' ],
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
						'Pass with_css=true to also receive the compiled Post_CSS for the post.',
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

		$css = '';
		if ( $with_css && $is_built ) {
			try {
				$post_css = \Elementor\Core\Files\CSS\Post::create( $post_id );
				$post_css->update();
				$css = (string) $post_css->get_content();
			} catch ( \Throwable $e ) {
				$css = '';
			}
		}

		return [
			'post_id'                 => $post_id,
			'html'                    => $html,
			'css'                     => $css,
			'is_built_with_elementor' => (bool) $is_built,
		];
	}
}

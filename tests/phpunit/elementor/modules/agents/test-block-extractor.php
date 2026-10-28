<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Extractors\Block_Extractor;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Block_Extractor extends Elementor_Test_Base {

	private Block_Extractor $extractor;

	public function setUp(): void {
		parent::setUp();

		$this->extractor = new Block_Extractor();
	}

	public function test_can_handle__returns_true_for_post_with_blocks() {
		$post = $this->create_post_with_content( '<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->' );

		$this->assertTrue( $this->extractor->can_handle( $post ) );
	}

	public function test_can_handle__returns_false_for_post_without_blocks() {
		$post = $this->create_post_with_content( 'Plain classic content, no blocks here.' );

		$this->assertFalse( $this->extractor->can_handle( $post ) );
	}

	public function test_extract__group_block_does_not_duplicate_inner_content() {
		$content = '<!-- wp:group --><div class="wp-block-group">'
			. '<!-- wp:paragraph --><p>Group duplicate marker alpha is only inside the group.</p><!-- /wp:paragraph -->'
			. '<!-- wp:heading --><h2>Group heading beta</h2><!-- /wp:heading -->'
			. '</div><!-- /wp:group -->';

		$post = $this->create_post_with_content( $content );

		$result = $this->extractor->extract( $post );

		$this->assertSame(
			1,
			substr_count( $result, 'Group duplicate marker alpha is only inside the group.' ),
			'Paragraph text inside the group must appear exactly once.'
		);
		$this->assertSame(
			1,
			substr_count( $result, 'Group heading beta' ),
			'Heading text inside the group must appear exactly once.'
		);
	}

	public function test_extract__unrecognised_container_falls_back_to_inner_blocks_when_render_is_empty() {
		add_filter( 'render_block', [ $this, 'force_empty_container_render' ], 10, 2 );

		try {
			$content = '<!-- wp:group --><div class="wp-block-group">'
				. '<!-- wp:paragraph --><p>Fallback marker gamma survives an empty wrapper render.</p><!-- /wp:paragraph -->'
				. '</div><!-- /wp:group -->';

			$post = $this->create_post_with_content( $content );

			$result = $this->extractor->extract( $post );
		} finally {
			remove_filter( 'render_block', [ $this, 'force_empty_container_render' ], 10 );
		}

		$this->assertStringContainsString( 'Fallback marker gamma survives an empty wrapper render.', $result );
	}

	public function force_empty_container_render( string $block_content, array $block ): string {
		if ( 'core/group' === ( $block['blockName'] ?? '' ) ) {
			return '<div class="wp-block-group"></div>';
		}

		return $block_content;
	}

	private function create_post_with_content( string $content ): \WP_Post {
		$post_id = $this->factory()->post->create( [
			'post_type'    => 'post',
			'post_status'  => 'publish',
			'post_content' => $content,
		] );

		return get_post( $post_id );
	}
}

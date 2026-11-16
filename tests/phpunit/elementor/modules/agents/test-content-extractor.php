<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Content_Extractor;
use Elementor\Modules\Agents\Components\Readability\Extractors\Extractor_Interface;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Content_Extractor extends Elementor_Test_Base {

	public function tearDown(): void {
		remove_all_filters( 'elementor/agents/markdown/extractors' );
		remove_all_filters( 'elementor/agents/markdown/coverage' );

		parent::tearDown();
	}

	public function test_ignores_invalid_extractor_entries_from_filter() {
		add_filter( 'elementor/agents/markdown/extractors', static function () {
			return [ 'not-an-extractor' ];
		} );

		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_content' => 'Classic body content long enough to pass the threshold.',
		] ) );

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( '', $result['id'] );
		$this->assertSame( '', $result['body'] );
	}

	public function test_extract_with_id__drops_invalid_entries_and_keeps_valid_ones() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$stub            = $this->make_extractor( 'stub', 10, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $stub ) {
			return [ 'not-an-extractor', $stub ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'stub', $result['id'] );
		$this->assertSame( $sufficient_body, $result['body'] );
	}

	public function test_extract_with_id__prefers_lower_priority() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$high_priority    = $this->make_extractor( 'high-priority', 50, $sufficient_body );
		$low_priority     = $this->make_extractor( 'low-priority', 5, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $high_priority, $low_priority ) {
			return [ $high_priority, $low_priority ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'low-priority', $result['id'] );
		$this->assertSame( $sufficient_body, $result['body'] );
	}

	public function test_extract_with_id__skips_extractor_that_cannot_handle() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$cannot_handle    = $this->make_extractor( 'cannot-handle', 5, $sufficient_body, false );
		$fallback         = $this->make_extractor( 'fallback', 30, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $cannot_handle, $fallback ) {
			return [ $cannot_handle, $fallback ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 0, $cannot_handle->extract_calls );
		$this->assertSame( 'fallback', $result['id'] );
	}

	public function test_extract_with_id__falls_through_when_below_min_content_chars() {
		$too_short_body   = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS - 1 );
		$sufficient_body  = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$below_threshold  = $this->make_extractor( 'below-threshold', 5, $too_short_body );
		$sufficient       = $this->make_extractor( 'sufficient', 30, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $below_threshold, $sufficient ) {
			return [ $below_threshold, $sufficient ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'sufficient', $result['id'] );
		$this->assertSame( $sufficient_body, $result['body'] );
	}

	public function test_extract_with_id__ignores_whitespace_when_measuring_length() {
		$whitespace_padded_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS - 1 ) . '   ';
		$sufficient_body        = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$below_threshold        = $this->make_extractor( 'below-threshold', 5, $whitespace_padded_body );
		$sufficient              = $this->make_extractor( 'sufficient', 30, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $below_threshold, $sufficient ) {
			return [ $below_threshold, $sufficient ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'sufficient', $result['id'] );
	}

	public function test_extract_with_id__stops_at_first_sufficient_body() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$first           = $this->make_extractor( 'first', 5, $sufficient_body );
		$second          = $this->make_extractor( 'second', 30, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $first, $second ) {
			return [ $first, $second ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$extractor->extract_with_id( $post );

		$this->assertSame( 0, $second->extract_calls );
	}

	public function test_extract_with_id__returns_empty_when_none_are_sufficient() {
		$too_short_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS - 1 );
		$cannot_handle  = $this->make_extractor( 'cannot-handle', 5, str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS ), false );
		$below_threshold = $this->make_extractor( 'below-threshold', 30, $too_short_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $cannot_handle, $below_threshold ) {
			return [ $cannot_handle, $below_threshold ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( '', $result['id'] );
		$this->assertSame( '', $result['body'] );
	}

	public function test_extract__returns_body_from_extract_with_id() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$stub            = $this->make_extractor( 'stub', 10, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $stub ) {
			return [ $stub ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();

		$this->assertSame( $sufficient_body, $extractor->extract( $post ) );
	}

	public function test_get_extractor_id__returns_id_from_extract_with_id() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$stub            = $this->make_extractor( 'stub', 10, $sufficient_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $stub ) {
			return [ $stub ];
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();

		$this->assertSame( 'stub', $extractor->get_extractor_id( $post ) );
	}

	public function test_elementor_only_coverage_skips_classic_content() {
		add_filter( 'elementor/agents/markdown/coverage', static function () {
			return 'elementor_only';
		} );

		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_content' => 'Classic body content long enough to pass the threshold.',
		] ) );

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( '', $result['body'] );
	}

	public function test_extract_with_id__elementor_only_keeps_elementor_id() {
		$classic_body   = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$elementor_body = str_repeat( 'b', Content_Extractor::MIN_CONTENT_CHARS );
		$classic        = $this->make_extractor( 'classic', 5, $classic_body );
		$elementor      = $this->make_extractor( 'elementor', 30, $elementor_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $classic, $elementor ) {
			return [ $classic, $elementor ];
		} );
		add_filter( 'elementor/agents/markdown/coverage', static function () {
			return 'elementor_only';
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'elementor', $result['id'] );
		$this->assertSame( $elementor_body, $result['body'] );
	}

	public function test_extract_with_id__unknown_coverage_uses_full_chain() {
		$sufficient_body = str_repeat( 'a', Content_Extractor::MIN_CONTENT_CHARS );
		$other_body      = str_repeat( 'b', Content_Extractor::MIN_CONTENT_CHARS );
		$other           = $this->make_extractor( 'other', 5, $sufficient_body );
		$elementor       = $this->make_extractor( 'elementor', 30, $other_body );

		add_filter( 'elementor/agents/markdown/extractors', static function () use ( $other, $elementor ) {
			return [ $other, $elementor ];
		} );
		add_filter( 'elementor/agents/markdown/coverage', static function () {
			return 'something-else';
		} );

		$post = $this->create_dummy_post();

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'other', $result['id'] );
	}

	public function test_extract_with_id__uses_classic_extractor_for_plain_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_content' => 'Classic body content long enough to pass the threshold.',
		] ) );

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( 'classic', $result['id'] );
		$this->assertStringContainsString( 'Classic body content long enough to pass the threshold.', $result['body'] );
	}

	public function test_extract_with_id__returns_empty_when_classic_body_is_below_threshold() {
		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_content' => 'Short.',
		] ) );

		$extractor = new Content_Extractor();
		$result    = $extractor->extract_with_id( $post );

		$this->assertSame( '', $result['id'] );
		$this->assertSame( '', $result['body'] );
	}

	private function create_dummy_post(): \WP_Post {
		return get_post( $this->factory()->post->create( [
			'post_status' => 'publish',
		] ) );
	}

	private function make_extractor( string $id, int $priority, string $body, bool $can_handle = true ): Extractor_Interface {
		return new class( $id, $priority, $body, $can_handle ) implements Extractor_Interface {
			public int $extract_calls = 0;

			private string $id;
			private int $priority;
			private string $body;
			private bool $can_handle;

			public function __construct( string $id, int $priority, string $body, bool $can_handle ) {
				$this->id         = $id;
				$this->priority   = $priority;
				$this->body       = $body;
				$this->can_handle = $can_handle;
			}

			public function can_handle( \WP_Post $post ): bool {
				return $this->can_handle;
			}

			public function extract( \WP_Post $post ): string {
				++$this->extract_calls;

				return $this->body;
			}

			public function get_id(): string {
				return $this->id;
			}

			public function get_priority(): int {
				return $this->priority;
			}
		};
	}
}

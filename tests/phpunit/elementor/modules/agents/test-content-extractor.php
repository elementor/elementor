<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Content_Extractor;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Content_Extractor extends Elementor_Test_Base {

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

		remove_all_filters( 'elementor/agents/markdown/extractors' );

		$this->assertSame( '', $result['id'] );
		$this->assertSame( '', $result['body'] );
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

		remove_all_filters( 'elementor/agents/markdown/coverage' );

		$this->assertSame( '', $result['body'] );
	}
}

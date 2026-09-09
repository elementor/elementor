<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Post_Noindex;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Post_Noindex extends Elementor_Test_Base {

	public function test_returns_false_for_indexable_post() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );

		$this->assertFalse( Post_Noindex::is_noindex( $post_id ) );
	}

	public function test_detects_yoast_noindex() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, '_yoast_wpseo_meta-robots-noindex', '1' );

		$this->assertTrue( Post_Noindex::is_noindex( $post_id ) );
	}

	public function test_detects_rankmath_noindex_array() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, 'rank_math_robots', [ 'noindex' ] );

		$this->assertTrue( Post_Noindex::is_noindex( $post_id ) );
	}

	public function test_detects_rankmath_noindex_string() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, 'rank_math_robots', 'noindex,nofollow' );

		$this->assertTrue( Post_Noindex::is_noindex( $post_id ) );
	}

	public function test_detects_aioseo_noindex() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, '_aioseo_noindex', '1' );

		$this->assertTrue( Post_Noindex::is_noindex( $post_id ) );
	}

	public function test_detects_seopress_noindex() {
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, '_seopress_robots_index', 'yes' );

		$this->assertTrue( Post_Noindex::is_noindex( $post_id ) );
	}
}

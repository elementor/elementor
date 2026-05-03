<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Relations extends Elementor_Test_Base {
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		parent::tearDown();
	}

	public function test_set_and_get_styles_for_post() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();
		$style_ids = [ 'g-1', 'g-2', 'g-3' ];

		$relations->set_styles_for_post( $post_id, $style_ids );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertEqualsCanonicalizing( $style_ids, $result );
	}

	public function test_get_styles_by_post__returns_empty_for_untracked_document() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();

		$result = $relations->get_styles_by_post( $post_id );

		$this->assertSame( [], $result );
	}

	public function test_set_styles_for_post__removes_duplicates() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();
		$style_ids = [ 'g-1', 'g-2', 'g-1', 'g-3', 'g-2' ];

		$relations->set_styles_for_post( $post_id, $style_ids );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertCount( 3, $result );
		$this->assertContains( 'g-1', $result );
		$this->assertContains( 'g-2', $result );
		$this->assertContains( 'g-3', $result );
	}

	public function test_set_styles_for_post__replaces_previous_styles() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();

		$relations->set_styles_for_post( $post_id, [ 'g-old-1', 'g-old-2' ] );
		$relations->set_styles_for_post( $post_id, [ 'g-new-1' ] );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertSame( [ 'g-new-1' ], $result );
	}

	public function test_get_posts_by_style__returns_posts_using_style() {
		$post_id_1 = $this->factory()->post->create();
		$post_id_2 = $this->factory()->post->create();
		$post_id_3 = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id_1;
		$this->created_post_ids[] = $post_id_2;
		$this->created_post_ids[] = $post_id_3;

		$relations = new Global_Classes_Relations();
		$relations->set_styles_for_post( $post_id_1, [ 'g-shared', 'g-1-only' ] );
		$relations->set_styles_for_post( $post_id_2, [ 'g-shared', 'g-2-only' ] );
		$relations->set_styles_for_post( $post_id_3, [ 'g-3-only' ] );

		$posts_using_shared = $relations->get_posts_by_style( 'g-shared' );
		$posts_using_1_only = $relations->get_posts_by_style( 'g-1-only' );
		$posts_using_nonexistent = $relations->get_posts_by_style( 'g-nonexistent' );

		$this->assertEqualsCanonicalizing( [ $post_id_1, $post_id_2 ], $posts_using_shared );
		$this->assertSame( [ $post_id_1 ], $posts_using_1_only );
		$this->assertSame( [], $posts_using_nonexistent );
	}

	public function test_clear_post_styles__removes_all_styles() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();
		$relations->set_styles_for_post( $post_id, [ 'g-1', 'g-2' ] );

		$relations->clear_post_styles( $post_id );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertSame( [], $result );
	}

	public function test_add_style_to_post__appends_single_style() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();
		$relations->set_styles_for_post( $post_id, [ 'g-1' ] );

		$relations->add_style_to_post( $post_id, 'g-2' );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertEqualsCanonicalizing( [ 'g-1', 'g-2' ], $result );
	}

	public function test_add_style_to_post__ignores_duplicate() {
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$relations = new Global_Classes_Relations();
		$relations->set_styles_for_post( $post_id, [ 'g-1', 'g-2' ] );

		$relations->add_style_to_post( $post_id, 'g-1' );

		$result = $relations->get_styles_by_post( $post_id );
		$this->assertCount( 2, $result );
	}
}

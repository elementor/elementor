<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Content_Catalog extends Elementor_Test_Base {

	private Markdown_Content_Catalog $catalog;

	public function setUp(): void {
		parent::setUp();

		$this->catalog = new Markdown_Content_Catalog();
	}

	public function tearDown(): void {
		delete_option( 'show_on_front' );
		delete_option( 'page_on_front' );

		parent::tearDown();
	}

	public function test_search__returns_published_public_posts_and_skips_drafts_and_noindex() {
		// Arrange
		$page_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Visible Page',
			'post_name'   => 'visible-page',
		] );
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'draft',
			'post_title'  => 'Draft Page',
		] );
		$noindex_id = $this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
			'post_title'  => 'Hidden Post',
		] );
		update_post_meta( $noindex_id, '_yoast_wpseo_meta-robots-noindex', '1' );

		// Act
		$items = $this->catalog->search( [ 'page', 'post' ], '' );

		// Assert
		$ids = array_column( $items, 'id' );
		$this->assertContains( $page_id, $ids );
		$this->assertNotContains( $noindex_id, $ids );
		$this->assertNotContains( 'Draft Page', array_column( $items, 'title' ) );

		$visible = $items[ array_search( $page_id, $ids, true ) ];
		$this->assertSame( 'Visible Page', $visible['title'] );
		$this->assertSame( 'page', $visible['type'] );
		$this->assertStringContainsString( 'visible-page', $visible['path'] );
	}

	public function test_search__fills_a_full_page_past_noindex_rows() {
		// Arrange
		$page_size = Markdown_Content_Catalog::PAGE_SIZE;

		for ( $index = 0; $index < $page_size; $index++ ) {
			$noindex_id = $this->factory()->post->create( [
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => sprintf( 'A Hidden %02d', $index ),
			] );
			update_post_meta( $noindex_id, '_yoast_wpseo_meta-robots-noindex', '1' );
		}

		$visible_ids = $this->factory()->post->create_many( $page_size, [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'B Visible',
		] );

		// Act
		$items = $this->catalog->search( [ 'page' ], '' );

		// Assert
		$this->assertCount( $page_size, $items );
		$this->assertEqualsCanonicalizing( $visible_ids, array_column( $items, 'id' ) );
	}

	public function test_search__pins_the_front_page_first_only_without_a_term() {
		// Arrange
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'About',
		] );
		$front_page_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Zebra Home',
		] );
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $front_page_id );

		// Act
		$default_items = $this->catalog->search( [ 'page' ], '' );
		$searched_items = $this->catalog->search( [ 'page' ], 'About' );

		// Assert
		$this->assertSame( $front_page_id, $default_items[0]['id'] );
		$this->assertCount( 1, array_keys( array_column( $default_items, 'id' ), $front_page_id, true ) );
		$this->assertNotContains( $front_page_id, array_column( $searched_items, 'id' ) );
	}

	public function test_search__matches_titles_only_within_the_given_post_types() {
		// Arrange
		$pricing_id = $this->factory()->post->create( [
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Pricing',
		] );
		$this->factory()->post->create( [
			'post_type'    => 'page',
			'post_status'  => 'publish',
			'post_title'   => 'Contact',
			'post_content' => 'See our pricing page.',
		] );
		$this->factory()->post->create( [
			'post_type'   => 'post',
			'post_status' => 'publish',
			'post_title'  => 'Pricing news',
		] );

		// Act
		$items = $this->catalog->search( [ 'page' ], 'pricing' );

		// Assert
		$this->assertSame( [ $pricing_id ], array_column( $items, 'id' ) );
	}

	public function test_search__returns_nothing_without_post_types() {
		// Arrange
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
		] );

		// Act
		$items = $this->catalog->search( [], '' );

		// Assert
		$this->assertSame( [], $items );
	}
}

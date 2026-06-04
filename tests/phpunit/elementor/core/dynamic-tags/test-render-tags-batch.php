<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Core\DynamicTags\Tag;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Render_Tags_Batch extends Elementor_Test_Base {

	private Dynamic_Tags_Manager $manager;

	public function set_up() {
		parent::set_up();

		$this->manager = Plugin::$instance->dynamic_tags;

		add_action(
			'elementor/dynamic_tags/register',
			function ( Dynamic_Tags_Manager $dynamic_tags_manager ) {
				$dynamic_tags_manager->register( $this->create_batch_test_tag() );
			}
		);

		do_action( 'elementor/dynamic_tags/register', $this->manager );
	}

	public function test_ajax_render_tags_batch__returns_empty_array_when_groups_missing() {
		// Act.
		$result = $this->manager->ajax_render_tags_batch( [] );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_ajax_render_tags_batch__resolves_tags_for_multiple_post_ids() {
		// Arrange.
		$post_one = $this->factory()->post->create_and_get();
		$post_two = $this->factory()->post->create_and_get();

		$settings = [ 'text' => 'hello' ];
		$cache_key_one = $this->build_cache_key( 'batch-test-tag', $settings, $post_one->ID );
		$cache_key_two = $this->build_cache_key( 'batch-test-tag', $settings, $post_two->ID );

		// Act.
		$result = $this->manager->ajax_render_tags_batch( [
			'groups' => [
				[
					'post_id' => $post_one->ID,
					'tags' => [ $cache_key_one ],
				],
				[
					'post_id' => $post_two->ID,
					'tags' => [ $cache_key_two ],
				],
			],
		] );

		// Assert.
		$this->assertArrayHasKey( $cache_key_one, $result );
		$this->assertArrayHasKey( $cache_key_two, $result );
		$this->assertSame( 'batch-content', $result[ $cache_key_one ] );
		$this->assertSame( 'batch-content', $result[ $cache_key_two ] );
	}

	public function test_ajax_render_tags_batch__skips_groups_without_edit_permission() {
		// Arrange.
		$author_id = $this->factory()->user->create( [ 'role' => 'author' ] );
		$own_post = $this->factory()->post->create_and_get( [ 'post_author' => $author_id ] );
		$other_post = $this->factory()->post->create_and_get();

		$settings = [ 'text' => 'hello' ];
		$allowed_key = $this->build_cache_key( 'batch-test-tag', $settings, $own_post->ID );
		$denied_key = $this->build_cache_key( 'batch-test-tag', $settings, $other_post->ID );

		wp_set_current_user( $author_id );

		// Act.
		$result = $this->manager->ajax_render_tags_batch( [
			'groups' => [
				[
					'post_id' => $own_post->ID,
					'tags' => [ $allowed_key ],
				],
				[
					'post_id' => $other_post->ID,
					'tags' => [ $denied_key ],
				],
			],
		] );

		// Assert.
		$this->assertArrayHasKey( $allowed_key, $result );
		$this->assertArrayNotHasKey( $denied_key, $result );
	}

	public function test_ajax_render_tags_batch__fires_before_and_after_render_per_group() {
		// Arrange.
		$post_one = $this->factory()->post->create_and_get();
		$post_two = $this->factory()->post->create_and_get();
		$settings = [ 'text' => 'hello' ];

		$before_count = 0;
		$after_count = 0;

		add_action(
			'elementor/dynamic_tags/before_render',
			function () use ( &$before_count ) {
				$before_count++;
			}
		);

		add_action(
			'elementor/dynamic_tags/after_render',
			function () use ( &$after_count ) {
				$after_count++;
			}
		);

		// Act.
		$this->manager->ajax_render_tags_batch( [
			'groups' => [
				[
					'post_id' => $post_one->ID,
					'tags' => [ $this->build_cache_key( 'batch-test-tag', $settings, $post_one->ID ) ],
				],
				[
					'post_id' => $post_two->ID,
					'tags' => [ $this->build_cache_key( 'batch-test-tag', $settings, $post_two->ID ) ],
				],
			],
		] );

		// Assert.
		$this->assertSame( 2, $before_count );
		$this->assertSame( 2, $after_count );
	}

	private function build_cache_key( string $tag_name, array $settings, int $post_id ): string {
		return base64_encode( $tag_name ) . '-' . base64_encode( rawurlencode( wp_json_encode( $settings ) ) ) . '-' . $post_id;
	}

	private function create_batch_test_tag(): Tag {
		return new class() extends Tag {
			public function get_name() {
				return 'batch-test-tag';
			}

			public function get_title() {
				return 'Batch Test Tag';
			}

			public function get_group() {
				return 'post';
			}

			public function get_categories() {
				return [ 'text' ];
			}

			protected function register_controls() {
				$this->add_control(
					'text',
					[
						'type' => 'text',
						'label' => 'Text',
						'default' => '',
					]
				);
			}

			protected function register_advanced_section() {}

			public function get_content() {
				return 'batch-content';
			}
		};
	}
}

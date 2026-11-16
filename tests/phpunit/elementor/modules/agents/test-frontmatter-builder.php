<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Frontmatter_Builder;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Frontmatter_Builder extends Elementor_Test_Base {

	public function test_escape_yaml_string_escapes_backslash_and_quotes() {
		$builder = new Frontmatter_Builder();
		$method  = new \ReflectionMethod( Frontmatter_Builder::class, 'escape_yaml_string' );
		$method->setAccessible( true );

		$this->assertSame( 'C:\\\\Users\\\\Docs', $method->invoke( $builder, 'C:\\Users\\Docs' ) );
		$this->assertSame( 'He said \\"hi\\"', $method->invoke( $builder, 'He said "hi"' ) );
	}

	public function test_build_escapes_yaml_special_characters_in_title() {
		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => wp_slash( 'C:\\Users\\Docs' ),
			'post_content' => 'Body with enough characters for extraction.',
		] );

		$post = get_post( $post_id );
		$yaml = ( new Frontmatter_Builder() )->build( $post );

		$this->assertStringContainsString( 'title: "C:\\\\Users\\\\Docs"', $yaml );
	}

	public function test_build_escapes_newlines_in_description() {
		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'YAML Escape Test',
			'post_excerpt' => "Line one\nLine two",
			'post_content' => 'Body with enough characters for extraction.',
		] );

		$post = get_post( $post_id );
		$yaml = ( new Frontmatter_Builder() )->build( $post );

		$this->assertStringContainsString( 'description: "Line one\\nLine two"', $yaml );
	}

	public function test_build_keeps_ampersand_in_permalink() {
		$permalink = 'https://example.test/page?a=1&b=2';
		$filter    = static function () use ( $permalink ) {
			return $permalink;
		};
		add_filter( 'post_link', $filter );

		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'Ampersand URL',
			'post_content' => 'Body with enough characters for extraction.',
		] );

		$yaml = ( new Frontmatter_Builder() )->build( get_post( $post_id ) );
		remove_filter( 'post_link', $filter );

		$this->assertStringContainsString( 'url: "' . $permalink . '"', $yaml );
		$this->assertStringContainsString( 'canonical: "' . $permalink . '"', $yaml );
		$this->assertStringNotContainsString( '&#038;', $yaml );
	}

	public function test_build_keeps_ampersand_in_featured_image() {
		$image_url = 'https://cdn.example.test/img.jpg?w=800&h=600';
		$id_filter = static function () {
			return 1;
		};
		$url_filter = static function () use ( $image_url ) {
			return $image_url;
		};
		add_filter( 'post_thumbnail_id', $id_filter );
		add_filter( 'post_thumbnail_url', $url_filter );

		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'Featured Image URL',
			'post_content' => 'Body with enough characters for extraction.',
		] );

		$yaml = ( new Frontmatter_Builder() )->build( get_post( $post_id ) );
		remove_filter( 'post_thumbnail_id', $id_filter );
		remove_filter( 'post_thumbnail_url', $url_filter );

		$this->assertStringContainsString( 'featured_image: "' . $image_url . '"', $yaml );
		$this->assertStringNotContainsString( '&#038;', $yaml );
	}
}

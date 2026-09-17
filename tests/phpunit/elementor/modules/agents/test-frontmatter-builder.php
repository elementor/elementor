<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Frontmatter_Builder;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Frontmatter_Builder extends Elementor_Test_Base {

	public function test_build_escapes_yaml_special_characters_in_title() {
		$post_id = $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'C:\\Users\\Docs',
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
}

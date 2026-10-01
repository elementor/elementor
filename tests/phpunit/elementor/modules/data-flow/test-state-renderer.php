<?php

use Elementor\Modules\DataFlow\State_Renderer;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Renderer extends TestCase {

	public function test_render__replaces_bindings_in_place_without_extra_markup() {
		// Arrange
		$html = '<p class="e-paragraph">Hi {{ state.name }}, latest: {{state.posts.0.title}}</p>';
		$state = [
			'name' => 'Ada',
			'posts' => [ [ 'title' => 'Hello' ] ],
		];

		// Act
		$result = State_Renderer::render( $html, $state );

		// Assert
		$this->assertSame( '<p class="e-paragraph">Hi Ada, latest: Hello</p>', $result['html'] );
		$this->assertSame( [
			[
				'template' => 'Hi {{ state.name }}, latest: {{state.posts.0.title}}',
				'text' => 'Hi Ada, latest: Hello',
			],
		], $result['bindings'] );
	}

	public function test_render__formats_values_like_the_client() {
		// Arrange
		$html = '<p>[{{state.missing}}] {{state.flag}} {{state.count}} {{state.user}}</p>';
		$state = [
			'flag' => true,
			'count' => 0,
			'user' => [ 'id' => 1 ],
		];

		// Act
		$result = State_Renderer::render( $html, $state );

		// Assert
		$this->assertSame( '<p>[] true 0 {&quot;id&quot;:1}</p>', $result['html'] );
		$this->assertSame( '[] true 0 {"id":1}', $result['bindings'][0]['text'] );
	}

	public function test_render__escapes_state_values() {
		// Arrange
		$html = '<p>{{state.title}}</p>';
		$state = [ 'title' => '<script>alert(1)</script>' ];

		// Act
		$result = State_Renderer::render( $html, $state );

		// Assert
		$this->assertSame( '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>', $result['html'] );
		$this->assertSame( '<script>alert(1)</script>', $result['bindings'][0]['text'] );
	}

	public function test_render__leaves_attributes_scripts_and_styles_untouched() {
		// Arrange
		$html = '<a title="{{state.name}}">x</a><script>var t = "{{state.name}}";</script><style>/* {{state.name}} */</style>';

		// Act
		$result = State_Renderer::render( $html, [ 'name' => 'Ada' ] );

		// Assert
		$this->assertSame( $html, $result['html'] );
		$this->assertSame( [], $result['bindings'] );
	}

	public function test_has_bindings() {
		// Act & Assert
		$this->assertTrue( State_Renderer::has_bindings( '<p>{{state.a}}</p>' ) );
		$this->assertFalse( State_Renderer::has_bindings( '<p>{{ other.a }}</p>' ) );
	}
}

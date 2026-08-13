<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Hoister;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/stub-dynamic-tags-manager.php';

class Test_V3_Dynamic_Hoister extends TestCase {

	public function test_hoist__passes_through_non_dynamic_capable_settings() {
		// Arrange.
		$hoister = new V3_Dynamic_Hoister( new Stub_Dynamic_Tags_Manager() );
		$controls = [
			'title' => [ 'type' => 'text' ],
		];

		// Act.
		$result = $hoister->hoist( 'theme-post-title', [ 'title' => 'Hello world' ], $controls );

		// Assert.
		$this->assertSame( [ 'title' => 'Hello world' ], $result['primitives'] );
		$this->assertSame( [], $result['shortcodes'] );
		$this->assertSame( [], $result['errors'] );
	}

	public function test_hoist__coerces_top_level_dynamic_into_shortcode_without_primitive() {
		// Arrange.
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'post-title', [ 'text' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$controls = [
			'title' => [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ],
		];

		// Act.
		$result = $hoister->hoist(
			'theme-post-title',
			[ 'title' => [ 'name' => 'post-title', 'settings' => [] ] ],
			$controls
		);

		// Assert.
		$this->assertSame( [], $result['primitives'] );
		$this->assertArrayHasKey( 'title', $result['shortcodes'] );
		$this->assertStringContainsString( 'name="post-title"', $result['shortcodes']['title'] );
		$this->assertSame( [], $result['errors'] );
	}

	public function test_hoist__accepts_nested_dynamic_on_url_control_property() {
		// Arrange.
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'post-url', [ 'url' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$controls = [
			'link' => [
				'type' => 'url',
				'dynamic' => [
					'active' => true,
					'categories' => [ 'url' ],
					'property' => 'url',
				],
			],
		];

		// Act.
		$result = $hoister->hoist(
			'theme-post-title',
			[ 'link' => [ 'url' => [ 'name' => 'post-url', 'settings' => [] ] ] ],
			$controls
		);

		// Assert.
		$this->assertSame( [], $result['primitives'] );
		$this->assertArrayHasKey( 'link', $result['shortcodes'] );
		$this->assertStringContainsString( 'name="post-url"', $result['shortcodes']['link'] );
		$this->assertSame( [], $result['errors'] );
	}

	public function test_hoist__errors_when_tag_is_not_registered() {
		// Arrange.
		$hoister = new V3_Dynamic_Hoister( new Stub_Dynamic_Tags_Manager() );
		$controls = [
			'title' => [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ],
		];

		// Act.
		$result = $hoister->hoist(
			'theme-post-title',
			[ 'title' => [ 'name' => 'not-a-tag' ] ],
			$controls
		);

		// Assert.
		$this->assertSame( [], $result['primitives'] );
		$this->assertSame( [], $result['shortcodes'] );
		$this->assertCount( 1, $result['errors'] );
		$this->assertStringContainsString( 'not registered', $result['errors'][0] );
	}

	public function test_hoist__errors_when_tag_categories_do_not_intersect_control() {
		// Arrange.
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'wrong-cat', [ 'gallery' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$controls = [
			'title' => [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ],
		];

		// Act.
		$result = $hoister->hoist(
			'theme-post-title',
			[ 'title' => [ 'name' => 'wrong-cat' ] ],
			$controls
		);

		// Assert.
		$this->assertSame( [], $result['primitives'] );
		$this->assertSame( [], $result['shortcodes'] );
		$this->assertCount( 1, $result['errors'] );
		$this->assertStringContainsString( 'not compatible', $result['errors'][0] );
	}

	public function test_hoist__accepts_any_registered_tag_when_control_declares_no_categories() {
		// Arrange.
		$manager = new Stub_Dynamic_Tags_Manager();
		$manager->add_stub_tag( 'post-title', [ 'text' ] );
		$hoister = new V3_Dynamic_Hoister( $manager );
		$controls = [
			'title' => [ 'type' => 'text', 'dynamic' => [ 'active' => true ] ],
		];

		// Act.
		$result = $hoister->hoist(
			'theme-post-title',
			[ 'title' => [ 'name' => 'post-title' ] ],
			$controls
		);

		// Assert.
		$this->assertSame( [], $result['primitives'] );
		$this->assertArrayHasKey( 'title', $result['shortcodes'] );
		$this->assertSame( [], $result['errors'] );
	}
}

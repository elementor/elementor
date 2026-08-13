<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Dynamic_Resolver extends TestCase {

	protected function setUp(): void {
		parent::setUp();
		V3_Dynamic_Resolver::set_tag_info_resolver( function ( $name ) {
			$catalog = [
				'post-title' => [ 'name' => 'post-title', 'categories' => [ 'text' ] ],
				'post-url' => [ 'name' => 'post-url', 'categories' => [ 'url' ] ],
				'wrong-cat' => [ 'name' => 'wrong-cat', 'categories' => [ 'gallery' ] ],
			];
			return $catalog[ $name ] ?? null;
		} );
		V3_Dynamic_Resolver::set_shortcode_builder( function ( $id, $name, $settings ) {
			return sprintf( '[elementor-tag id="%s" name="%s" settings="%s"]', $id, $name, rawurlencode( json_encode( $settings ) ) );
		} );
	}

	protected function tearDown(): void {
		V3_Dynamic_Resolver::set_tag_info_resolver( null );
		V3_Dynamic_Resolver::set_shortcode_builder( null );
		parent::tearDown();
	}

	public function test_try_resolve__returns_unmatched_when_control_is_not_dynamic_capable() {
		// Arrange.
		$control = [ 'type' => 'text' ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', [ 'name' => 'post-title' ], $control );

		// Assert.
		$this->assertFalse( $result['matched'] );
	}

	public function test_try_resolve__returns_unmatched_when_value_is_a_plain_scalar() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', 'Hello world', $control );

		// Assert.
		$this->assertFalse( $result['matched'] );
	}

	public function test_try_resolve__coerces_top_level_dynamic_into_shortcode_and_neutral_primitive() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', [ 'name' => 'post-title', 'settings' => [] ], $control );

		// Assert.
		$this->assertTrue( $result['matched'] );
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertStringContainsString( 'name="post-title"', $result['shortcode'] );
		$this->assertSame( '', $result['primitive'] );
	}

	public function test_try_resolve__accepts_nested_dynamic_on_url_control_property() {
		// Arrange.
		$control = [
			'type' => 'url',
			'dynamic' => [
				'active' => true,
				'categories' => [ 'url' ],
				'property' => 'url',
			],
		];

		$value = [
			'url' => [ 'name' => 'post-url', 'settings' => [] ],
		];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'link', $value, $control );

		// Assert.
		$this->assertTrue( $result['matched'] );
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertStringContainsString( 'name="post-url"', $result['shortcode'] );
		$this->assertSame(
			[ 'url' => '', 'is_external' => '', 'nofollow' => '' ],
			$result['primitive']
		);
	}

	public function test_try_resolve__errors_when_tag_is_not_registered() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', [ 'name' => 'not-a-tag' ], $control );

		// Assert.
		$this->assertTrue( $result['matched'] );
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'not registered', $result['error']->get_error_message() );
	}

	public function test_try_resolve__errors_when_tag_categories_do_not_intersect_control() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true, 'categories' => [ 'text' ] ] ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', [ 'name' => 'wrong-cat' ], $control );

		// Assert.
		$this->assertTrue( $result['matched'] );
		$this->assertInstanceOf( \WP_Error::class, $result['error'] );
		$this->assertStringContainsString( 'not compatible', $result['error']->get_error_message() );
	}

	public function test_try_resolve__accepts_any_registered_tag_when_control_declares_no_categories() {
		// Arrange.
		$control = [ 'type' => 'text', 'dynamic' => [ 'active' => true ] ];

		// Act.
		$result = V3_Dynamic_Resolver::try_resolve( 'title', [ 'name' => 'post-title' ], $control );

		// Assert.
		$this->assertTrue( $result['matched'] );
		$this->assertArrayNotHasKey( 'error', $result );
		$this->assertStringContainsString( 'name="post-title"', $result['shortcode'] );
	}
}

<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Dynamic_Tags_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Dynamic_Tags_Ability extends TestCase {

	public function test_uri_constant() {
		// Arrange
		$ability = new List_Dynamic_Tags_Ability();

		// Assert
		$this->assertSame( 'elementor://dynamic-tags', List_Dynamic_Tags_Ability::URI );
		$this->assertSame( 'elementor/list-dynamic-tags', $this->get_ability_id( $ability ) );
	}

	public function test_execute_with_mock_returns_json_with_expected_shape() {
		// Arrange
		$tag = [
			'name'        => 'post-title',
			'label'       => 'Post Title',
			'categories'  => [ 'text' ],
			'props_schema' => [],
		];

		$registry = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_tags' ] )
			->getMock();
		$registry->method( 'get_tags' )->willReturn( [ $tag ] );

		$tags_module          = new \stdClass();
		$tags_module->registry = $registry;

		$ability = new List_Dynamic_Tags_Ability();

		// Act
		$result  = $ability->execute( [], $tags_module );
		$decoded = json_decode( $result, true );

		// Assert
		$this->assertIsString( $result );
		$this->assertCount( 1, $decoded );
		$this->assertArrayHasKey( 'name', $decoded[0] );
		$this->assertArrayHasKey( 'label', $decoded[0] );
		$this->assertArrayHasKey( 'categories', $decoded[0] );
		$this->assertArrayHasKey( 'settings', $decoded[0] );
		$this->assertSame( 'post-title', $decoded[0]['name'] );
	}

	private function get_ability_id( List_Dynamic_Tags_Ability $ability ): string {
		$reflection = new \ReflectionMethod( $ability, 'get_ability_id' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}
}

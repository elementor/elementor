<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Variables_Ability;
use Elementor\Modules\Variables\Services\Variables_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Variables_Ability extends Elementor_Test_Base {

	public function test_execute__returns_active_variables_excluding_soft_deleted() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'load' )->willReturn( [
			'data' => [
				'a1' => [ 'label' => 'brand', 'value' => '#000', 'type' => 'global-color-variable' ],
				'a2' => [ 'label' => 'gone', 'value' => '#fff', 'type' => 'global-color-variable', 'deleted' => true ],
			],
			'watermark' => 3,
		] );

		$ability = new List_Variables_Ability( $service );

		$result = $ability->execute();

		$this->assertArrayHasKey( 'a1', $result );
		$this->assertArrayNotHasKey( 'a2', $result );
		$this->assertSame( 'brand', $result['a1']['label'] );
	}

	public function test_execute__returns_empty_when_no_variables() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'load' )->willReturn( [ 'data' => [], 'watermark' => 0 ] );

		$ability = new List_Variables_Ability( $service );

		$this->assertSame( [], $ability->execute() );
	}

	public function test_definition__declares_public_json_resource_at_expected_uri() {
		$ability = new List_Variables_Ability();

		$ref = new \ReflectionMethod( $ability, 'get_definition' );
		$ref->setAccessible( true );
		$def = $ref->invoke( $ability )->to_array();

		$this->assertSame( 'resource', $def['meta']['mcp']['type'] );
		$this->assertSame( 'elementor://global-variables', $def['meta']['mcp']['uri'] );
		$this->assertSame( 'application/json', $def['meta']['mcp']['mimeType'] );
		$this->assertTrue( $def['meta']['mcp']['public'] );
	}
}

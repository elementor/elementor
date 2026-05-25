<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Manage_Post_Ability;
use ElementorEditorTesting\Elementor_Test_Base;
use ReflectionClass;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Element_Css_Transformer extends Elementor_Test_Base {

	public function test_transform_elements_with_css__converts_css_to_local_style() {
		$ability = new Manage_Post_Ability();
		$method  = ( new ReflectionClass( $ability ) )->getMethod( 'prepare_elements_for_save' );
		$method->setAccessible( true );

		$elements = $method->invoke( $ability, [
			'elements' => [
				[
					'id'         => 'abc1234',
					'elType'     => 'widget',
					'widgetType' => 'e-heading',
					'css'        => 'color:#ff0000;font-size:24px',
					'settings'   => [
						'title' => [
							'$$type' => 'html-v3',
							'value'  => [
								'content'  => [
									'$$type' => 'string',
									'value'  => 'Hello',
								],
								'children' => [],
							],
						],
					],
				],
			],
		] );

		$this->assertIsArray( $elements );
		$this->assertCount( 1, $elements );
		$this->assertArrayNotHasKey( 'css', $elements[0] );
		$this->assertArrayHasKey( 'styles', $elements[0] );
		$this->assertArrayHasKey( 'e-abc1234-s', $elements[0]['styles'] );
		$this->assertSame( 'classes', $elements[0]['settings']['classes']['$$type'] );
		$this->assertContains( 'e-abc1234-s', $elements[0]['settings']['classes']['value'] );
		$this->assertSame( 'color', $elements[0]['styles']['e-abc1234-s']['variants'][0]['props']['color']['$$type'] );
	}
}

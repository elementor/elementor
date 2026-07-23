<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Utils\Llm_Guidance_Builder;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Llm_Guidance_Builder extends Elementor_Test_Base {

	public function test_build__default_settings_are_plain_values() {
		// Arrange
		$config = [
			'meta' => [],
			'base_settings' => [
				'title' => [
					'$$type' => 'string',
					'value' => 'Default Title',
				],
			],
			'atomic_props_schema' => [
				'title' => String_Prop_Type::make(),
			],
		];

		// Act
		$guidance = Llm_Guidance_Builder::build( $config, 'e-heading', [] );

		// Assert
		$this->assertArrayHasKey( 'default_settings', $guidance );
		$this->assertSame( 'Default Title', $guidance['default_settings']['title'] );
		$this->assertIsString( $guidance['default_settings']['title'] );
	}
}

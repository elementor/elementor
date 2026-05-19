<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Scoped_Dynamic_Css_Emitter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Scoped_Dynamic_Css_Emitter extends Elementor_Test_Base {
	public function test_emit__produces_var_placeholder_and_definitions() {
		$emitter = new Scoped_Dynamic_Css_Emitter();
		$dynamic_node = [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'fake-tag',
				'settings' => [],
			],
		];

		$result = $emitter->emit(
			[
				'color' => 'red',
				'z-index' => $dynamic_node,
			],
			'my-class',
			0
		);

		$this->assertSame( [ 'color' => 'red' ], $result['static_props'] );
		$this->assertStringContainsString( 'z-index:var(--e-dyn-my-class-v0-z-index);', $result['placeholder_css'] );
		$this->assertArrayHasKey( '--e-dyn-my-class-v0-z-index', $result['definitions'] );
		$this->assertSame( $dynamic_node, $result['definitions']['--e-dyn-my-class-v0-z-index'] );
	}
}

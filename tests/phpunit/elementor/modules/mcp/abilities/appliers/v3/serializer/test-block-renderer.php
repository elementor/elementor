<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Serializer;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Block_Renderer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Block_Renderer extends TestCase {

	const BASE_BREAKPOINT = 'desktop';

	const MOBILE_BREAKPOINT = 'mobile';

	public function test_render_targets__renders_default_target_bare_and_other_targets_as_alias_blocks() {
		// Arrange.
		$main_menu = new V3_Block_Accumulator();
		$main_menu->push( self::BASE_BREAKPOINT, null, 'color', 'red' );
		$main_menu->push( self::BASE_BREAKPOINT, 'hover', 'color', 'blue' );
		$main_menu->push( self::MOBILE_BREAKPOINT, null, 'font-size', '10px' );

		$dropdown = new V3_Block_Accumulator();
		$dropdown->push( self::BASE_BREAKPOINT, null, 'color', 'green' );
		$dropdown->push( self::BASE_BREAKPOINT, 'current', 'color', 'black' );
		$dropdown->push( self::MOBILE_BREAKPOINT, null, 'font-size', '8px' );

		// Act.
		$css = ( new Block_Renderer() )->render_targets(
			[
				'main-menu' => $main_menu,
				'dropdown' => $dropdown,
			],
			'main-menu'
		);

		// Assert.
		$this->assertSame(
			'color: red; &:hover { color: blue; } dropdown { color: green; } dropdown:current { color: black; } '
			. '@media(--mobile) { font-size: 10px; dropdown { font-size: 8px; } }',
			$css
		);
	}

	public function test_render_targets__skips_empty_targets() {
		// Arrange.
		$dropdown = new V3_Block_Accumulator();
		$dropdown->push( self::MOBILE_BREAKPOINT, null, 'color', 'green' );

		// Act.
		$css = ( new Block_Renderer() )->render_targets(
			[
				'main-menu' => new V3_Block_Accumulator(),
				'dropdown' => $dropdown,
			],
			'main-menu'
		);

		// Assert.
		$this->assertSame( '@media(--mobile) { dropdown { color: green; } }', $css );
	}
}

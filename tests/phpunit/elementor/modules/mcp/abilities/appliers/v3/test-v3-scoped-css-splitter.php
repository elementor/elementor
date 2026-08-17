<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Scoped_Css_Splitter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Scoped_Css_Splitter extends TestCase {

	public function test_split__extracts_inner_element_blocks() {
		// Arrange.
		$css = 'main-menu { color: red; } dropdown { color: blue; }';

		// Act.
		$result = V3_Scoped_Css_Splitter::split( $css, [ 'main-menu', 'dropdown', 'toggle' ] );

		// Assert.
		$this->assertSame( '', $result['wrapper'] );
		$this->assertSame( 'color: red;', $result['scopes']['main-menu'] );
		$this->assertSame( 'color: blue;', $result['scopes']['dropdown'] );
	}

	public function test_split__handles_state_scopes() {
		// Arrange.
		$css = 'main-menu:hover { color: green; } dropdown:active { color: navy; }';

		// Act.
		$result = V3_Scoped_Css_Splitter::split( $css, [ 'main-menu', 'dropdown' ] );

		// Assert.
		$this->assertSame( 'color: green;', $result['scopes']['main-menu:hover'] );
		$this->assertSame( 'color: navy;', $result['scopes']['dropdown:active'] );
	}

	public function test_split__preserves_media_queries_inside_scope() {
		// Arrange.
		$css = 'main-menu { color: red; @media (max-width: 768px) { padding-left: 5px; } }';

		// Act.
		$result = V3_Scoped_Css_Splitter::split( $css, [ 'main-menu' ] );

		// Assert.
		$this->assertStringContainsString( '@media (max-width: 768px)', $result['scopes']['main-menu'] );
		$this->assertStringContainsString( 'padding-left: 5px;', $result['scopes']['main-menu'] );
	}

	public function test_split__keeps_unknown_selectors_in_wrapper() {
		// Arrange.
		$css = 'main-menu { color: red; } .unknown { margin: 1px; }';

		// Act.
		$result = V3_Scoped_Css_Splitter::split( $css, [ 'main-menu' ] );

		// Assert.
		$this->assertSame( 'color: red;', $result['scopes']['main-menu'] );
		$this->assertStringContainsString( '.unknown { margin: 1px; }', $result['wrapper'] );
	}

	public function test_scope_to_mapper_css__wraps_state_scopes() {
		// Act.
		$css = V3_Scoped_Css_Splitter::scope_to_mapper_css( 'main-menu:hover', 'color: red;' );

		// Assert.
		$this->assertSame( '&:hover { color: red; }', $css );
	}
}

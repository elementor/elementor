<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\V3_Style_Target_Router;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Style_Target_Router extends TestCase {

	const DEFAULT_TARGET = 'main-menu';

	const TARGET_STATES = [
		'main-menu' => [ 'default', 'hover', 'current' ],
		'dropdown' => [ 'default' ],
	];

	private function route( string $css ): array {
		return ( new V3_Style_Target_Router() )->route( $css, self::DEFAULT_TARGET, self::TARGET_STATES );
	}

	public function test_route__sends_bare_declarations_and_ampersand_states_to_the_default_target() {
		// Act.
		$result = $this->route( 'color: red; &:hover { color: blue; } font-size: 12px;' );

		// Assert.
		$this->assertSame(
			[
				[
					'target' => 'main-menu',
					'state' => null,
					'css' => 'color: red; font-size: 12px;',
				],
				[
					'target' => 'main-menu',
					'state' => 'hover',
					'css' => 'color: blue;',
				],
			],
			$result['blocks']
		);
		$this->assertSame( [], $result['dropped'] );
	}

	public function test_route__sends_alias_blocks_to_their_target_and_declared_state() {
		// Act.
		$result = $this->route( 'dropdown { color: red; } main-menu:current { color: blue; }' );

		// Assert.
		$this->assertSame(
			[
				[
					'target' => 'dropdown',
					'state' => null,
					'css' => 'color: red;',
				],
				[
					'target' => 'main-menu',
					'state' => 'current',
					'css' => 'color: blue;',
				],
			],
			$result['blocks']
		);
	}

	public function test_route__drops_unknown_targets_states_and_nested_blocks() {
		// Act.
		$result = $this->route( 'toggle { color: red; } dropdown:hover { color: blue; } dropdown { &:hover { color: green; } }' );

		// Assert.
		$this->assertSame( [], $result['blocks'] );
		$this->assertSame(
			[
				[
					'selector' => 'toggle',
					'reason' => V3_Style_Target_Router::REASON_UNKNOWN_TARGET,
				],
				[
					'selector' => 'dropdown:hover',
					'reason' => V3_Style_Target_Router::REASON_UNKNOWN_STATE,
				],
				[
					'selector' => 'dropdown',
					'reason' => V3_Style_Target_Router::REASON_NESTED_BLOCK,
				],
			],
			$result['dropped']
		);
	}

	public function test_route__ignores_braces_inside_quoted_values() {
		// Act.
		$result = $this->route( 'font-family: "a{b}"; dropdown { font-family: \'c}\'; }' );

		// Assert.
		$this->assertSame( 'font-family: "a{b}";', $result['blocks'][0]['css'] );
		$this->assertSame( 'font-family: \'c}\';', $result['blocks'][1]['css'] );
		$this->assertSame( [], $result['dropped'] );
	}

	public function test_route__drops_the_rest_when_a_block_is_unclosed() {
		// Act.
		$result = $this->route( 'color: red; dropdown { color: blue;' );

		// Assert.
		$this->assertSame( 'color: red;', $result['blocks'][0]['css'] );
		$this->assertSame( V3_Style_Target_Router::REASON_MALFORMED, $result['dropped'][0]['reason'] );
	}
}

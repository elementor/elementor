<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Fallback_Css;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Fallback_Css extends TestCase {

	const WIDGET_TYPE = 'heading-like';

	const CONFIG_ID = 'title';

	const HAND_WRITTEN_CSS = 'selector { outline: 1px solid red; }';

	const CUSTOM_MEDIA_BLOCK = '@media (min-width: 2000px) { selector { color: blue; } }';

	const NOTE = 'font-weight: 650 (title): CSS property font-weight has a value this Elementor widget cannot store.';

	public function setUp(): void {
		parent::setUp();

		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Heading-like widget.' )
			->default_target(
				Style_Target::make( 'title' )
					->selector( '.title' )
					->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			);
		$controls = [ 'title_color' => [ 'type' => 'color' ] ];

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $map ],
			static fn() => false
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	private function fallback_css( bool $has_pro ): V3_Map_Fallback_Css {
		return new V3_Map_Fallback_Css( $has_pro, [ 'mobile' => '(max-width: 767px)' ] );
	}

	private static function result(): array {
		return [
			'fallback_rules' => [
				[
					'target' => 'title',
					'state' => null,
					'breakpoint' => 'desktop',
					'declarations' => [ 'font-weight' => '650' ],
					'replaces' => [ 'font-weight' ],
				],
			],
			'fallback_notes' => [ self::NOTE ],
		];
	}

	public function test_apply__merges_fallback_rules_into_custom_css_and_says_so() {
		// Arrange.
		$node = [ 'settings' => [ 'custom_css' => self::HAND_WRITTEN_CSS ] ];
		$warnings = Warnings_Bag::make();

		// Act.
		$this->fallback_css( true )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, $warnings );

		// Assert.
		$this->assertSame(
			self::HAND_WRITTEN_CSS . "\n" . V3_Custom_Css_Fallback::SECTION_START . "\nselector .title { font-weight: 650; }\n" . V3_Custom_Css_Fallback::SECTION_END,
			$node['settings']['custom_css']
		);
		$this->assertSame( [ '[' . self::CONFIG_ID . '] ' . self::NOTE . ' Written to the widget custom CSS instead.' ], $warnings->messages() );
	}

	public function test_apply__skips_fallback_rules_without_pro_and_says_why() {
		// Arrange.
		$node = [ 'settings' => [] ];
		$warnings = Warnings_Bag::make();

		// Act.
		$this->fallback_css( false )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, $warnings );

		// Assert.
		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
		$this->assertSame( [ '[' . self::CONFIG_ID . '] ' . self::NOTE . ' It was skipped because custom CSS requires Elementor Pro.' ], $warnings->messages() );
	}

	public function test_apply__keeps_media_queries_the_map_cannot_route_verbatim() {
		// Arrange.
		$node = [ 'settings' => [] ];
		$warnings = Warnings_Bag::make();
		$result = [
			'fallback_rules' => [],
			'fallback_notes' => [],
			'unmapped_css' => self::CUSTOM_MEDIA_BLOCK,
		];

		// Act.
		$this->fallback_css( true )->apply( $node, $result, self::WIDGET_TYPE, self::CONFIG_ID, $warnings );

		// Assert.
		$this->assertSame(
			V3_Custom_Css_Fallback::SECTION_START . "\n" . self::CUSTOM_MEDIA_BLOCK . "\n" . V3_Custom_Css_Fallback::SECTION_END,
			$node['settings']['custom_css']
		);
		$this->assertSame(
			[ '[' . self::CONFIG_ID . '] Media queries other than @media(--<breakpoint>) were written to the widget custom CSS as is: ' . self::CUSTOM_MEDIA_BLOCK ],
			$warnings->messages()
		);
	}

	public function test_apply__removes_custom_css_once_the_last_fallback_is_replaced() {
		// Arrange.
		$node = [ 'settings' => [] ];
		$this->fallback_css( true )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, Warnings_Bag::make() );
		$replaced = [
			'fallback_rules' => [ array_merge( self::result()['fallback_rules'][0], [ 'declarations' => [] ] ) ],
			'fallback_notes' => [],
		];

		// Act.
		$this->fallback_css( true )->apply( $node, $replaced, self::WIDGET_TYPE, self::CONFIG_ID, Warnings_Bag::make() );

		// Assert.
		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
	}
}

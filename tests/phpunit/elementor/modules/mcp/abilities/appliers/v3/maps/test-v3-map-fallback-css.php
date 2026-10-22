<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
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

	const NOTE = 'font-weight: 650 (title): CSS property font-weight has a value this Elementor widget cannot store.';

	const FALLBACK_RULE_CSS = 'selector .title { font-weight: 650 !important; }';

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
					'media' => null,
					'declarations' => [ 'font-weight' => '650' ],
				],
			],
			'fallback_notes' => [ self::NOTE ],
		];
	}

	public function test_apply__appends_fallback_rules_to_custom_css_and_says_so() {
		// Arrange.
		$node = [ 'settings' => [ 'custom_css' => self::HAND_WRITTEN_CSS ] ];
		$warnings = Warnings_Bag::make();

		// Act.
		$this->fallback_css( true )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, $warnings );

		// Assert.
		$this->assertSame( self::HAND_WRITTEN_CSS . "\n" . self::FALLBACK_RULE_CSS, $node['settings']['custom_css'] );
		$this->assertSame( [ '[' . self::CONFIG_ID . '] ' . self::NOTE . ' Written to the widget custom CSS instead.' ], $warnings->messages() );
	}

	public function test_apply__merges_into_the_existing_rule_of_the_same_target() {
		// Arrange.
		$node = [ 'settings' => [ 'custom_css' => 'selector .title { font-weight: 600; letter-spacing: 1px; }' ] ];

		// Act.
		$this->fallback_css( true )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, Warnings_Bag::make() );

		// Assert.
		$this->assertSame( 'selector .title { font-weight: 650 !important; letter-spacing: 1px !important; }', $node['settings']['custom_css'] );
	}

	public function test_apply__skips_fallback_rules_without_pro_with_the_v4_unsupported_css_code() {
		// Arrange.
		$node = [ 'settings' => [] ];
		$warnings = Warnings_Bag::make();

		// Act.
		$this->fallback_css( false )->apply( $node, self::result(), self::WIDGET_TYPE, self::CONFIG_ID, $warnings );

		// Assert.
		$this->assertArrayNotHasKey( 'custom_css', $node['settings'] );
		$this->assertSame( [ Style_Applier::UNSUPPORTED_CSS_CODE ], array_column( $warnings->all(), 'code' ) );
		$this->assertSame( [ '[' . self::CONFIG_ID . '] ' . self::NOTE . ' It was skipped because custom CSS requires Elementor Pro.' ], $warnings->messages() );
	}
}

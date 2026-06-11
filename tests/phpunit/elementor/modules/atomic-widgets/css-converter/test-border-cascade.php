<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Color_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Dimensions_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Object_Side_Merge_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\String_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Border_Shorthand_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * End-to-end (DB-less) cascade across every border mechanism at once: the all-sides shorthand, a
 * per-side shorthand, expansion, the single->object seed merge, and the unrepresentable per-side color
 * that falls to custom_css. Asserts CSS last-wins semantics.
 */
class Test_Border_Cascade extends TestCase {
	const STYLE_KEYWORDS = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];
	const WIDTH_KEYS = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];

	public function test_mixed_border_shorthands__last_wins() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act: border sets all sides 1px/solid/blue; border-left overrides the left width and color.
		$result = $dispatcher->convert( 'border: 1px solid blue; border-left: 4px red;' );

		// Assert: left width wins (4px) over the seeded 1px; style/all-sides color stay props; the
		// per-side color has no representation and lands in custom_css.
		$this->assertEquals(
			[
				'border-width' => [
					'$$type' => 'border-width',
					'value' => [
						'block-start' => $this->size( 1 ),
						'inline-end' => $this->size( 1 ),
						'block-end' => $this->size( 1 ),
						'inline-start' => $this->size( 4 ),
					],
				],
				'border-style' => [ '$$type' => 'string', 'value' => 'solid' ],
				'border-color' => [ '$$type' => 'color', 'value' => 'blue' ],
			],
			$result['props']
		);
		$this->assertSame( 'border-left-color: red;', $result['customCss'] );
	}

	public function test_mixed_border__all_sides_shorthand_after_per_side_resets_width() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act: per-side first, then the all-sides shorthand which must reset every width side.
		$result = $dispatcher->convert( 'border-left-width: 4px; border: 1px solid blue;' );

		// Assert: border-width collapses back to the single 1px (shorthand overrides the longhand).
		$this->assertSame( $this->size( 1 ), $result['props']['border-width'] );
		$this->assertSame( '', $result['customCss'] );
	}

	private function make_dispatcher(): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Dimensions_Property_Converter( 'border-width', Border_Width_Prop_Type::class ) )
			->register( new String_Property_Converter( 'border-style', self::STYLE_KEYWORDS ) )
			->register( new Color_Property_Converter( 'border-color' ) )
			->register( new Object_Side_Merge_Converter(
				'border-left-width',
				'border-width',
				'border-width',
				'inline-start',
				self::WIDTH_KEYS,
				Border_Width_Prop_Type::class
			) );

		$expanders = ( new Expander_Registry() )
			->register( new Border_Shorthand_Expander( 'border', $this->longhands( '' ), self::STYLE_KEYWORDS ) )
			->register( new Border_Shorthand_Expander( 'border-left', $this->longhands( 'left-' ), self::STYLE_KEYWORDS ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter(), $expanders );
	}

	private function longhands( string $infix ): array {
		return [
			'width' => "border-{$infix}width",
			'style' => "border-{$infix}style",
			'color' => "border-{$infix}color",
		];
	}

	private function size( int $value ): array {
		return [ '$$type' => 'size', 'value' => [ 'size' => $value, 'unit' => 'px' ] ];
	}
}

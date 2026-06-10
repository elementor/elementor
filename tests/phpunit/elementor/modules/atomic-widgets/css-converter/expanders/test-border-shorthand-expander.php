<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Color_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Dimensions_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\String_Property_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Border_Shorthand_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Border_Shorthand_Expander extends TestCase {
	const STYLE_KEYWORDS = [ 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset' ];
	const ALL_SIDES_LONGHANDS = [ 'width' => 'border-width', 'style' => 'border-style', 'color' => 'border-color' ];

	public function test_expand__full_shorthand_splits_into_three_longhands() {
		// Arrange.
		$expander = $this->make_expander();

		// Act.
		$rules = $expander->expand( [ 'property' => 'border', 'value' => '1px solid red' ] );

		// Assert: emitted width/style/color, each with its own declaration.
		$this->assertSame(
			[
				[ 'property' => 'border-width', 'value' => '1px', 'declaration' => 'border-width: 1px' ],
				[ 'property' => 'border-style', 'value' => 'solid', 'declaration' => 'border-style: solid' ],
				[ 'property' => 'border-color', 'value' => 'red', 'declaration' => 'border-color: red' ],
			],
			$rules
		);
	}

	public function test_expand__order_independent_classification() {
		// Arrange.
		$expander = $this->make_expander();

		// Act: color, style, width in a scrambled order.
		$rules = $expander->expand( [ 'property' => 'border', 'value' => 'red dashed 2px' ] );

		// Assert: always emitted in width/style/color order regardless of input order.
		$this->assertSame( [ 'border-width', 'border-style', 'border-color' ], array_column( $rules, 'property' ) );
		$this->assertSame( [ '2px', 'dashed', 'red' ], array_column( $rules, 'value' ) );
	}

	public function test_expand__only_present_parts_are_emitted() {
		// Arrange.
		$expander = $this->make_expander();

		// Act.
		$rules = $expander->expand( [ 'property' => 'border', 'value' => 'solid red' ] );

		// Assert: no border-width since width was omitted (no CSS-initial reset).
		$this->assertSame(
			[
				[ 'property' => 'border-style', 'value' => 'solid', 'declaration' => 'border-style: solid' ],
				[ 'property' => 'border-color', 'value' => 'red', 'declaration' => 'border-color: red' ],
			],
			$rules
		);
	}

	public function test_expand__keeps_paren_value_intact() {
		// Arrange.
		$expander = $this->make_expander();

		// Act: rgb() has internal spaces that must not split.
		$rules = $expander->expand( [ 'property' => 'border', 'value' => '1px solid rgb(0, 0, 0)' ] );

		// Assert.
		$this->assertSame(
			[ 'property' => 'border-color', 'value' => 'rgb(0, 0, 0)', 'declaration' => 'border-color: rgb(0, 0, 0)' ],
			$rules[2]
		);
	}

	public function test_expand__width_keyword_classifies_as_width() {
		// Arrange.
		$expander = $this->make_expander();

		// Act.
		$rules = $expander->expand( [ 'property' => 'border', 'value' => 'thin solid red' ] );

		// Assert: `thin` is a width keyword (the longhand converter may later reject it).
		$this->assertSame( 'border-width', $rules[0]['property'] );
		$this->assertSame( 'thin', $rules[0]['value'] );
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_expand__declines_ambiguous_value( string $value ) {
		// Arrange.
		$expander = $this->make_expander();

		// Act & Assert: empty result -> caller keeps the original `border` for custom_css.
		$this->assertSame( [], $expander->expand( [ 'property' => 'border', 'value' => $value ] ) );
	}

	public function declined_values(): array {
		return [
			'two colors' => [ 'red blue' ],
			'two widths' => [ '1px 2px' ],
			'two styles' => [ 'solid dashed' ],
			'empty' => [ '   ' ],
		];
	}

	public function test_dispatcher__border_expands_then_converts_into_longhand_props() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'border: 1px solid red;' );

		// Assert: three real converters produced three props, nothing left over.
		$this->assertSame( '', $result['customCss'] );
		$this->assertSame(
			[ 'border-width', 'border-style', 'border-color' ],
			array_keys( $result['props'] )
		);
		$this->assertSame( [ '$$type' => 'size', 'value' => [ 'size' => 1, 'unit' => 'px' ] ], $result['props']['border-width'] );
		$this->assertSame( [ '$$type' => 'string', 'value' => 'solid' ], $result['props']['border-style'] );
		$this->assertSame( [ '$$type' => 'color', 'value' => 'red' ], $result['props']['border-color'] );
	}

	public function test_dispatcher__later_longhand_overrides_expanded_value() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act: explicit border-color after the shorthand must win (cascade preserved).
		$result = $dispatcher->convert( 'border: 1px solid red; border-color: blue;' );

		// Assert.
		$this->assertSame( [ '$$type' => 'color', 'value' => 'blue' ], $result['props']['border-color'] );
	}

	public function test_dispatcher__width_keyword_degrades_to_custom_css_per_side() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act: `thin` can't convert as a Size, so only that longhand falls to custom_css.
		$result = $dispatcher->convert( 'border: thin solid red;' );

		// Assert.
		$this->assertSame( [ 'border-style', 'border-color' ], array_keys( $result['props'] ) );
		$this->assertSame( 'border-width: thin;', $result['customCss'] );
	}

	public function test_dispatcher__ambiguous_border_is_kept_as_custom_css() {
		// Arrange.
		$dispatcher = $this->make_dispatcher();

		// Act.
		$result = $dispatcher->convert( 'border: 1px 2px;' );

		// Assert: declined expansion keeps the original shorthand verbatim.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'border: 1px 2px;', $result['customCss'] );
	}

	public function test_expand__known_color_var_routes_to_border_color() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'primary-border' )->willReturn( [
			'id' => 'e-gv-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'primary-border',
			'value' => '#112233',
		] );

		$rules = $this->make_expander( $service )->expand( [
			'property' => 'border',
			'value' => 'var(--primary-border)',
		] );

		$this->assertSame(
			[
				[
					'property' => 'border-color',
					'value' => 'var(--primary-border)',
					'declaration' => 'border-color: var(--primary-border)',
				],
			],
			$rules
		);
	}

	public function test_expand__known_size_var_routes_to_border_width() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'border-width-token' )->willReturn( [
			'id' => 'e-gv-2',
			'type' => Size_Variable_Prop_Type::get_key(),
			'label' => 'border-width-token',
			'value' => '2px',
		] );

		$rules = $this->make_expander( $service )->expand( [
			'property' => 'border',
			'value' => 'var(--border-width-token)',
		] );

		$this->assertSame(
			[
				[
					'property' => 'border-width',
					'value' => 'var(--border-width-token)',
					'declaration' => 'border-width: var(--border-width-token)',
				],
			],
			$rules
		);
	}

	public function test_expand__unknown_var_only_shorthand_declines() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->willReturn( null );

		$rules = $this->make_expander( $service )->expand( [
			'property' => 'border',
			'value' => 'var(--external-border)',
		] );

		$this->assertSame( [], $rules );
	}

	public function test_expand__mixed_shorthand_with_known_color_var() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'primary-border' )->willReturn( [
			'id' => 'e-gv-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'primary-border',
			'value' => '#112233',
		] );

		$rules = $this->make_expander( $service )->expand( [
			'property' => 'border',
			'value' => '1px solid var(--primary-border)',
		] );

		$this->assertSame(
			[
				[ 'property' => 'border-width', 'value' => '1px', 'declaration' => 'border-width: 1px' ],
				[ 'property' => 'border-style', 'value' => 'solid', 'declaration' => 'border-style: solid' ],
				[
					'property' => 'border-color',
					'value' => 'var(--primary-border)',
					'declaration' => 'border-color: var(--primary-border)',
				],
			],
			$rules
		);
	}

	public function test_dispatcher__known_color_var_expands_to_border_color_prop() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'primary-border' )->willReturn( [
			'id' => 'e-gv-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'primary-border',
			'value' => '#112233',
		] );

		$result = $this->make_dispatcher( $service )->convert( 'border: 1px solid var(--primary-border);' );

		$this->assertSame( '', $result['customCss'] );
		$this->assertSame(
			[ '$$type' => 'color', 'value' => 'var(--primary-border)' ],
			$result['props']['border-color']
		);
	}

	public function test_expand__per_side_shorthand_emits_side_longhands() {
		// Arrange: border-top maps roles to per-side property names.
		$expander = new Border_Shorthand_Expander(
			'border-top',
			[ 'width' => 'border-top-width', 'style' => 'border-top-style', 'color' => 'border-top-color' ],
			self::STYLE_KEYWORDS
		);

		// Act.
		$rules = $expander->expand( [ 'property' => 'border-top', 'value' => '1px solid red' ] );

		// Assert.
		$this->assertSame(
			[
				[ 'property' => 'border-top-width', 'value' => '1px', 'declaration' => 'border-top-width: 1px' ],
				[ 'property' => 'border-top-style', 'value' => 'solid', 'declaration' => 'border-top-style: solid' ],
				[ 'property' => 'border-top-color', 'value' => 'red', 'declaration' => 'border-top-color: red' ],
			],
			$rules
		);
	}

	private function make_expander( ?Variables_Service $variables_service = null ): Border_Shorthand_Expander {
		return new Border_Shorthand_Expander(
			'border',
			self::ALL_SIDES_LONGHANDS,
			self::STYLE_KEYWORDS,
			$variables_service
		);
	}

	private function make_dispatcher( ?Variables_Service $variables_service = null ): Css_Converter {
		$registry = ( new Converter_Registry() )
			->register( new Dimensions_Property_Converter( 'border-width' ) )
			->register( new String_Property_Converter( 'border-style', self::STYLE_KEYWORDS ) )
			->register( new Color_Property_Converter( 'border-color' ) );

		$expanders = ( new Expander_Registry() )
			->register( $this->make_expander( $variables_service ) );

		return new Css_Converter( $registry, new Null_Failure_Reporter(), $expanders );
	}
}

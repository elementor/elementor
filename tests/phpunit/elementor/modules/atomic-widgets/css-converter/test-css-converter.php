<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Conversion_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Setting_Converter extends Property_Converter_Base {
	private array $properties;

	public function __construct( array $properties ) {
		$this->properties = $properties;
	}

	protected function get_supported_properties(): array {
		return $this->properties;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$context->set_prop( $rule['property'], $rule['value'] );

		return true;
	}
}

class Mock_Declining_Converter extends Property_Converter_Base {
	private array $properties;

	public function __construct( array $properties ) {
		$this->properties = $properties;
	}

	protected function get_supported_properties(): array {
		return $this->properties;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		return false;
	}
}

class Mock_Throwing_Converter extends Property_Converter_Base {
	private array $properties;

	public function __construct( array $properties ) {
		$this->properties = $properties;
	}

	protected function get_supported_properties(): array {
		return $this->properties;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		throw new \RuntimeException( 'converter defect' );
	}
}

class Spy_Failure_Reporter implements Conversion_Failure_Reporter {
	public array $reports = [];

	public function report( string $property, string $category, array $context ): void {
		$this->reports[] = [
			'property' => $property,
			'category' => $category,
			'context' => $context,
		];
	}
}

class Test_Css_Converter extends TestCase {

	private function make( Converter_Registry $registry, $reporter = null ): Css_Converter {
		return new Css_Converter( $registry, $reporter ?? new Null_Failure_Reporter() );
	}

	public function test_convert__supported_rule_lands_in_props() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'color: red;' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_convert__unsupported_rule_falls_to_custom_css() {
		// Arrange.
		$converter = $this->make( new Converter_Registry() );

		// Act.
		$result = $converter->convert( 'z-index: 5;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'z-index: 5;', $result['customCss'] );
	}

	public function test_convert__mixed_input_splits_between_props_and_custom_css() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'color: red; z-index: 5;' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( 'z-index: 5;', $result['customCss'] );
	}

	public function test_convert__declined_converter_falls_through_to_next() {
		// Arrange.
		$registry = ( new Converter_Registry() )
			->register( new Mock_Declining_Converter( [ 'color' ] ) )
			->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'color: red;' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_convert__throw_is_treated_as_decline_and_reported() {
		// Arrange.
		$reporter = new Spy_Failure_Reporter();
		$registry = ( new Converter_Registry() )->register( new Mock_Throwing_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry, $reporter );

		// Act.
		$result = $converter->convert( 'color: red;' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( 'color: red;', $result['customCss'] );
		$this->assertCount( 1, $reporter->reports );
		$this->assertSame( 'color', $reporter->reports[0]['property'] );
		$this->assertSame( Conversion_Failure_Reporter::CATEGORY_EXCEPTION, $reporter->reports[0]['category'] );
	}

	public function test_convert__throw_is_rescued_by_next_converter_but_still_reported() {
		// Arrange.
		$reporter = new Spy_Failure_Reporter();
		$registry = ( new Converter_Registry() )
			->register( new Mock_Throwing_Converter( [ 'color' ] ) )
			->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry, $reporter );

		// Act.
		$result = $converter->convert( 'color: red;' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
		$this->assertCount( 1, $reporter->reports );
	}

	public function test_convert__blocked_declarations_are_dropped_entirely() {
		// Arrange.
		$converter = $this->make( new Converter_Registry() );

		// Act.
		$result = $converter->convert( 'behavior: url(x.htc); color: expression(alert(1)); background: url(javascript:alert(1));' );

		// Assert.
		$this->assertSame( [], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_convert__legit_lookalike_property_is_not_blocked() {
		// Arrange.
		$converter = $this->make( new Converter_Registry() );

		// Act.
		$result = $converter->convert( 'scroll-behavior: smooth;' );

		// Assert.
		$this->assertSame( 'scroll-behavior: smooth;', $result['customCss'] );
	}

	public function test_convert__ignores_empty_and_malformed_declarations() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( ' ; color: red ;; not-a-declaration ; ' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_convert__semicolon_inside_quotes_does_not_end_the_declaration() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'content', 'font-family', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'content: "a;b"; font-family: \'x;y\', serif; color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'content' => '"a;b"',
				'font-family' => '\'x;y\', serif',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__escaped_quote_does_not_close_the_string() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'content', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'content: "a\";b"; color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'content' => '"a\";b"',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__semicolon_inside_parentheses_does_not_end_the_declaration() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'background-image', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'background-image: url(data:image/png;base64,AAAA); color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'background-image' => 'url(data:image/png;base64,AAAA)',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__unquoted_url_contents_are_raw_data() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'background-image', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'background-image: url(/img/*/it\'s.svg); color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'background-image' => 'url(/img/*/it\'s.svg)',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__escaped_characters_outside_strings_are_literal() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'font-family', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'font-family: A\"B\(; color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'font-family' => 'A\"B\(',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__comments_are_removed() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color', 'padding' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'color: red; /* note; with semicolon */ padding: 4px /* trailing */;' );

		// Assert.
		$this->assertSame(
			[
				'color' => 'red',
				'padding' => '4px',
			],
			$result['props']
		);
		$this->assertSame( '', $result['customCss'] );
	}

	public function test_convert__comment_markers_inside_quotes_are_kept() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'content', 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'content: "/* a; */"; color: blue;' );

		// Assert.
		$this->assertSame(
			[
				'content' => '"/* a; */"',
				'color' => 'blue',
			],
			$result['props']
		);
	}

	public function test_convert__unterminated_comment_drops_only_the_comment() {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( 'color: red; /* open; padding: 4px;' );

		// Assert.
		$this->assertSame( [ 'color' => 'red' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	/**
	 * @dataProvider unterminated_value_provider
	 */
	public function test_convert__unterminated_value_is_dropped( string $css ) {
		// Arrange.
		$registry = ( new Converter_Registry() )->register( new Mock_Setting_Converter( [ 'color' ] ) );
		$converter = $this->make( $registry );

		// Act.
		$result = $converter->convert( $css );

		// Assert.
		$this->assertSame( [ 'color' => 'blue' ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

	public function unterminated_value_provider(): array {
		return [
			'open double quote' => [ 'color: blue; content: "a;' ],
			'open single quote' => [ 'color: blue; content: \'a;' ],
			'open parenthesis' => [ 'color: blue; background-image: url(a.png;' ],
		];
	}
}

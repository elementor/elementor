<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Default_Styles_Builder;
use PHPUnit\Framework\TestCase;

// Elementor\Utils is not resolved by the unit-bootstrap autoloader because its file lives under
// includes/utils.php; Default_Styles_Repository::is_allowed_tag depends on it transitively.
require_once dirname( rtrim( ABSPATH, '/' ), 2 ) . '/includes/utils.php';

class Stub_Default_Styles_Repository extends Default_Styles_Repository {

	private array $stub_data;

	public function __construct( array $stub_data = [] ) {
		parent::__construct();
		$this->stub_data = $stub_data;
	}

	public function get( string $tag ): ?array {
		return $this->stub_data[ $tag ] ?? null;
	}
}

class Test_Element_Default_Styles_Builder extends TestCase {

	public function test_collect_base_style_props_flattens_all_variants() {
		// Arrange.
		$base_styles = [
			'base' => [
				'variants' => [
					[ 'props' => [ 'margin' => 'M1', 'color' => 'C1' ] ],
					[ 'props' => [ 'padding' => 'P1' ] ],
				],
			],
			'link-base' => [
				'variants' => [
					[ 'props' => [ 'all' => 'unset' ] ],
				],
			],
		];

		// Act.
		$props = Element_Default_Styles_Builder::collect_base_style_props( $base_styles );

		// Assert.
		$this->assertSame(
			[ 'margin' => 'M1', 'color' => 'C1', 'padding' => 'P1', 'all' => 'unset' ],
			$props
		);
	}

	public function test_collect_merged_props_returns_only_base_when_no_repository() {
		// Arrange.
		$base_styles = [
			'base' => [ 'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ] ],
		];

		// Act.
		$merged = Element_Default_Styles_Builder::collect_merged_props( $base_styles, 'h1', null );

		// Assert.
		$this->assertSame( [ 'margin' => 'M1' ], $merged );
	}

	public function test_collect_merged_props_returns_only_base_when_tag_null() {
		// Arrange.
		$base_styles = [
			'base' => [ 'variants' => [ [ 'props' => [ 'color' => 'C1' ] ] ] ],
		];
		$repository = new Stub_Default_Styles_Repository( [
			'h1' => [ 'variants' => [ [ 'props' => [ 'color' => 'KIT' ] ] ] ],
		] );

		// Act.
		$merged = Element_Default_Styles_Builder::collect_merged_props( $base_styles, null, $repository );

		// Assert.
		$this->assertSame( [ 'color' => 'C1' ], $merged );
	}

	public function test_collect_merged_props_kit_default_overrides_base_on_conflict() {
		// Arrange.
		$base_styles = [
			'base' => [
				'variants' => [
					[ 'props' => [ 'margin' => 'BASE_MARGIN', 'color' => 'BASE_COLOR' ] ],
				],
			],
		];
		$repository = new Stub_Default_Styles_Repository( [
			'h1' => [
				'variants' => [
					[ 'props' => [ 'color' => 'KIT_COLOR', 'font-size' => 'KIT_FONT' ] ],
				],
			],
		] );

		// Act.
		$merged = Element_Default_Styles_Builder::collect_merged_props( $base_styles, 'h1', $repository );

		// Assert: kit wins on conflict (color), base preserved for uncontended keys (margin), kit adds new keys (font-size).
		$this->assertSame(
			[ 'margin' => 'BASE_MARGIN', 'color' => 'KIT_COLOR', 'font-size' => 'KIT_FONT' ],
			$merged
		);
	}

	public function test_collect_merged_props_ignores_missing_tag_in_repository() {
		// Arrange.
		$base_styles = [
			'base' => [ 'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ] ],
		];
		$repository = new Stub_Default_Styles_Repository( [] );

		// Act.
		$merged = Element_Default_Styles_Builder::collect_merged_props( $base_styles, 'h1', $repository );

		// Assert.
		$this->assertSame( [ 'margin' => 'M1' ], $merged );
	}

	public function test_collect_merged_props_returns_empty_when_nothing_to_merge() {
		// Arrange.
		$repository = new Stub_Default_Styles_Repository();

		// Act.
		$merged = Element_Default_Styles_Builder::collect_merged_props( [], null, $repository );

		// Assert.
		$this->assertSame( [], $merged );
	}

	public function test_build_returns_empty_map_when_no_props() {
		// Arrange.
		$repository = new Stub_Default_Styles_Repository();

		// Act.
		$result = Element_Default_Styles_Builder::build( [], null, $repository );

		// Assert: build() short-circuits before Style_Props_To_Css::to_map when there are no props,
		// so we can safely assert on the empty return without needing WordPress boot.
		$this->assertSame( [], $result );
	}
}

<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Default_Styles_Builder;
use PHPUnit\Framework\TestCase;

// Elementor\Utils is not resolved by the unit-bootstrap autoloader because its file lives under
// includes/utils.php; Default_Styles_Repository::is_allowed_tag depends on it transitively.
require_once dirname( __DIR__, 7 ) . '/includes/utils.php';

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

	public function test_render_concatenates_base_and_kit_default_css_in_cascade_order() {
		// Arrange.
		$base_styles = [
			'e-heading-base' => [
				'id' => 'e-heading-base',
				'type' => 'class',
				'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ],
			],
		];
		$kit_item = [
			'id' => 'h1',
			'type' => 'class',
			'cssName' => 'e-default-h1',
			'variants' => [ [ 'props' => [ 'color' => 'red' ] ] ],
		];
		$repository = new Stub_Default_Styles_Repository( [ 'h1' => $kit_item ] );

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->exactly( 2 ) )
			->method( 'render' )
			->withConsecutive(
				[ array_values( $base_styles ) ],
				[ [ $kit_item ] ]
			)
			->willReturnOnConsecutiveCalls( 'BASE_CSS', 'DEFAULT_CSS' );

		// Act.
		$result = Element_Default_Styles_Builder::render( $base_styles, 'h1', $repository, $renderer );

		// Assert.
		$this->assertSame( 'BASE_CSS' . "\n" . 'DEFAULT_CSS', $result );
	}

	public function test_render_returns_only_base_css_when_tag_is_null() {
		// Arrange.
		$base_styles = [
			'e-heading-base' => [
				'id' => 'e-heading-base',
				'type' => 'class',
				'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ],
			],
		];
		$repository = new Stub_Default_Styles_Repository( [
			'h1' => [ 'variants' => [ [ 'props' => [ 'color' => 'KIT' ] ] ] ],
		] );

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->once() )
			->method( 'render' )
			->with( array_values( $base_styles ) )
			->willReturn( 'BASE_CSS' );

		// Act.
		$result = Element_Default_Styles_Builder::render( $base_styles, null, $repository, $renderer );

		// Assert.
		$this->assertSame( 'BASE_CSS', $result );
	}

	public function test_render_returns_only_base_css_when_kit_tag_missing() {
		// Arrange.
		$base_styles = [
			'e-heading-base' => [
				'id' => 'e-heading-base',
				'type' => 'class',
				'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ],
			],
		];
		$repository = new Stub_Default_Styles_Repository();

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->once() )
			->method( 'render' )
			->with( array_values( $base_styles ) )
			->willReturn( 'BASE_CSS' );

		// Act.
		$result = Element_Default_Styles_Builder::render( $base_styles, 'h1', $repository, $renderer );

		// Assert.
		$this->assertSame( 'BASE_CSS', $result );
	}

	public function test_render_returns_only_kit_default_when_base_styles_empty() {
		// Arrange.
		$kit_item = [
			'id' => 'p',
			'type' => 'class',
			'cssName' => 'e-default-p',
			'variants' => [ [ 'props' => [ 'color' => 'blue' ] ] ],
		];
		$repository = new Stub_Default_Styles_Repository( [ 'p' => $kit_item ] );

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->once() )
			->method( 'render' )
			->with( [ $kit_item ] )
			->willReturn( 'DEFAULT_CSS' );

		// Act.
		$result = Element_Default_Styles_Builder::render( [], 'p', $repository, $renderer );

		// Assert.
		$this->assertSame( 'DEFAULT_CSS', $result );
	}

	public function test_render_returns_empty_string_when_no_layers() {
		// Arrange.
		$repository = new Stub_Default_Styles_Repository();

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->never() )->method( 'render' );

		// Act.
		$result = Element_Default_Styles_Builder::render( [], null, $repository, $renderer );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_render_kit_default_returns_css_for_tag() {
		$kit_item = [
			'id' => 'button',
			'type' => 'class',
			'cssName' => 'e-default-button',
			'variants' => [ [ 'props' => [ 'background-color' => '#8a6262' ] ] ],
		];
		$repository = new Stub_Default_Styles_Repository( [ 'button' => $kit_item ] );

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->once() )
			->method( 'render' )
			->with( [ $kit_item ] )
			->willReturn( 'DEFAULT_CSS' );

		$result = Element_Default_Styles_Builder::render_kit_default( 'button', $repository, $renderer );

		$this->assertSame( 'DEFAULT_CSS', $result );
	}

	public function test_render_kit_default_returns_empty_when_repository_null() {
		$this->assertSame( '', Element_Default_Styles_Builder::render_kit_default( 'h1', null ) );
	}

	public function test_render_kit_default_returns_empty_when_tag_null() {
		$repository = new Stub_Default_Styles_Repository( [ 'h1' => [ 'variants' => [] ] ] );

		$this->assertSame( '', Element_Default_Styles_Builder::render_kit_default( null, $repository ) );
	}

	public function test_render_kit_default_returns_empty_when_tag_missing_in_repository() {
		$repository = new Stub_Default_Styles_Repository();

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->never() )->method( 'render' );

		$this->assertSame( '', Element_Default_Styles_Builder::render_kit_default( 'h1', $repository, $renderer ) );
	}

	public function test_render_skips_kit_layer_when_repository_is_null() {
		// Arrange.
		$base_styles = [
			'e-heading-base' => [
				'id' => 'e-heading-base',
				'type' => 'class',
				'variants' => [ [ 'props' => [ 'margin' => 'M1' ] ] ],
			],
		];

		$renderer = $this->createMock( Styles_Renderer::class );
		$renderer->expects( $this->once() )
			->method( 'render' )
			->with( array_values( $base_styles ) )
			->willReturn( 'BASE_CSS' );

		// Act.
		$result = Element_Default_Styles_Builder::render( $base_styles, 'h1', null, $renderer );

		// Assert.
		$this->assertSame( 'BASE_CSS', $result );
	}
}

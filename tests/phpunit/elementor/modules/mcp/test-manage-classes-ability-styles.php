<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

require_once __DIR__ . '/test-manage-classes-ability-base.php';

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Classes_Ability_Styles extends Test_Manage_Classes_Ability_Base {

	public function test_create__with_css_string_produces_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: red;' )
			->willReturn( [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red;',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 1, $captured_variants );
		$this->assertSame( 'desktop', $captured_variants[0]['meta']['breakpoint'] );
		$this->assertNull( $captured_variants[0]['meta']['state'] );
		$this->assertSame( [ 'color' => 'red' ], $captured_variants[0]['props'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_create__styles_with_hover_produces_two_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red; &:hover { color: blue; }' )
			->willReturn( [
				'blocks' => [
					[ 'selector' => null, 'css' => 'color: red;' ],
					[ 'selector' => ':hover', 'css' => ' color: blue; ' ],
				],
			] );
		$converter->method( 'convert' )
			->willReturnMap( [
				[ 'color: red;', [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] ],
				[ ' color: blue; ', [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] ],
			] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; &:hover { color: blue; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 2, $captured_variants );

		$by_state = [];
		foreach ( $captured_variants as $v ) {
			$by_state[ $v['meta']['state'] ?? 'null' ] = $v;
		}

		$this->assertSame( [ 'color' => 'red' ], $by_state['null']['props'] );
		$this->assertSame( 'desktop', $by_state['null']['meta']['breakpoint'] );
		$this->assertSame( [ 'color' => 'blue' ], $by_state['hover']['props'] );
		$this->assertSame( 'desktop', $by_state['hover']['meta']['breakpoint'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_create__styles_parse_error_returns_operation_error() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [], 'error' => 'Unclosed brace at line 1' ] );

		// Act.
		$result = $this->make_ability_with_converter( null, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; &:hover { unclosed',
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_css', $result['results'][0]['code'] );
	}

	public function test_create__stray_closing_bracket_returns_error() {
		// Arrange.
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		// Act.
		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_css', $result['results'][0]['code'] );
	}

	public function test_create__malformed_media_block_returns_error() {
		// Arrange.
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		// Act.
		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { color: red;',
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_css', $result['results'][0]['code'] );
	}

	public function test_create__unknown_breakpoint_returns_error() {
		// Arrange.
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		// Act.
		$result = $this->make_ability_with_breakpoints( [ 'desktop' ], null, $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => '@media(--tablet) { color: red; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_css', $result['results'][0]['code'] );
		$this->assertStringContainsString( 'tablet', $result['results'][0]['message'] );
		$this->assertStringContainsString( 'desktop', $result['results'][0]['message'] );
	}

	public function test_create__default_alias_is_always_valid() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: red;' )
			->willReturn( [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] );

		// Act.
		$result = $this->make_ability_with_breakpoints( [ 'desktop' ], $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => '@media(--default) { color: red; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
	}

	public function test_create__empty_hover_block_produces_no_variant() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( '&:hover {}' )
			->willReturn( [
				'blocks' => [
					[ 'selector' => null, 'css' => '' ],
					[ 'selector' => ':hover', 'css' => '' ],
				],
			] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with(
				$this->callback( function ( $touched ) {
					$item = reset( $touched );
					$this->assertEmpty( $item['variants'] );
					return true;
				} ),
				$this->anything(),
				$this->anything()
			);

		// Act.
		$result = $this->make_ability_with_breakpoints( [ 'desktop' ], $converter, $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => '&:hover {}',
			],
		] ) );

		// Assert — operation succeeds; no hover variant created for the empty block.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
	}

	public function test_create__multi_breakpoint_styles_produce_multiple_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturnMap( [
				[ 'color: red;', [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] ],
				[ 'color: pink;', [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: pink;' ] ] ] ],
			] );
		$converter->method( 'convert' )
			->willReturnMap( [
				[ 'color: red;', [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] ],
				[ 'color: pink;', [ 'props' => [ 'color' => 'pink' ], 'customCss' => '', 'rejected' => [] ] ],
			] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_breakpoints( [ 'desktop', 'mobile' ], $converter, $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; @media(--mobile) { color: pink; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 2, $captured_variants );

		$by_bp = [];
		foreach ( $captured_variants as $v ) {
			$by_bp[ $v['meta']['breakpoint'] ] = $v;
		}

		$this->assertArrayHasKey( 'desktop', $by_bp );
		$this->assertSame( [ 'color' => 'red' ], $by_bp['desktop']['props'] );
		$this->assertNull( $by_bp['desktop']['meta']['state'] );
		$this->assertArrayHasKey( 'mobile', $by_bp );
		$this->assertSame( [ 'color' => 'pink' ], $by_bp['mobile']['props'] );
		$this->assertNull( $by_bp['mobile']['meta']['state'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_create__unrecognised_selector_appended_to_base_custom_css() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red; &:disabled { color: grey; }' )
			->willReturn( [
				'blocks' => [
					[ 'selector' => null, 'css' => 'color: red;' ],
					[ 'selector' => ':disabled', 'css' => ' color: grey; ' ],
				],
			] );
		$converter->method( 'convert' )
			->with( 'color: red;' )
			->willReturn( [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; &:disabled { color: grey; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 1, $captured_variants );
		$this->assertSame( 'desktop', $captured_variants[0]['meta']['breakpoint'] );
		$this->assertNull( $captured_variants[0]['meta']['state'] );
		$this->assertSame( [ 'color' => 'red' ], $captured_variants[0]['props'] );
		$this->assertNotNull( $captured_variants[0]['custom_css'] );
		$decoded = base64_decode( $captured_variants[0]['custom_css']['raw'] );
		$this->assertSame( '&:disabled { color: grey; }', $decoded );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_create__mixed_selectors_recognised_and_unrecognised() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [
				'blocks' => [
					[ 'selector' => null, 'css' => 'color: red;' ],
					[ 'selector' => ':hover', 'css' => ' color: blue; ' ],
					[ 'selector' => ':disabled', 'css' => ' color: grey; ' ],
					[ 'selector' => '.my-class', 'css' => ' font-weight: bold; ' ],
				],
			] );
		$converter->method( 'convert' )
			->willReturnMap( [
				[ 'color: red;', [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] ],
				[ ' color: blue; ', [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] ],
			] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => 'color: red; &:hover { color: blue; } &:disabled { color: grey; } &.my-class { font-weight: bold; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 2, $captured_variants );

		$by_state = [];
		foreach ( $captured_variants as $v ) {
			$by_state[ $v['meta']['state'] ?? 'null' ] = $v;
		}

		$this->assertArrayHasKey( 'null', $by_state );
		$this->assertSame( [ 'color' => 'red' ], $by_state['null']['props'] );
		$this->assertNotNull( $by_state['null']['custom_css'] );
		$decoded_base = base64_decode( $by_state['null']['custom_css']['raw'] );
		$this->assertStringContainsString( '&:disabled { color: grey; }', $decoded_base );
		$this->assertStringContainsString( '&.my-class { font-weight: bold; }', $decoded_base );
		$this->assertArrayHasKey( 'hover', $by_state );
		$this->assertSame( [ 'color' => 'blue' ], $by_state['hover']['props'] );
		$this->assertNull( $by_state['hover']['custom_css'] );
		$this->assertArrayNotHasKey( 'disabled', $by_state );
		$this->assertArrayNotHasKey( 'my-class', $by_state );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_create__only_unrecognised_selector_no_base_declarations() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [
				'blocks' => [
					[ 'selector' => null, 'css' => '' ],
					[ 'selector' => ':disabled', 'css' => ' color: grey; ' ],
				],
			] );
		$converter->method( 'convert' )
			->with( '' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$captured_variants = null;
		$repository        = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item              = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'css'    => '&:disabled { color: grey; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 1, $captured_variants );
		$this->assertSame( 'desktop', $captured_variants[0]['meta']['breakpoint'] );
		$this->assertNull( $captured_variants[0]['meta']['state'] );
		$this->assertEmpty( $captured_variants[0]['props'] );
		$this->assertNotNull( $captured_variants[0]['custom_css'] );
		$decoded = base64_decode( $captured_variants[0]['custom_css']['raw'] );
		$this->assertSame( '&:disabled { color: grey; }', $decoded );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__patch_mode_preserves_unaffected_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: blue;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: blue;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: blue;' )
			->willReturn( [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'pink' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: blue;',
				'mode'   => 'patch',
			],
		] ) );

		// Assert.
		$by_bp = [];
		foreach ( $captured_variants as $v ) {
			$by_bp[ $v['meta']['breakpoint'] ] = $v;
		}

		$this->assertArrayHasKey( 'mobile', $by_bp );
		$this->assertSame( 'pink', $by_bp['mobile']['props']['color'] );
		$this->assertSame( 'blue', $by_bp['desktop']['props']['color'] );
		$this->assertSame( '14px', $by_bp['desktop']['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__replace_mode_discards_affected_breakpoint_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: blue;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: blue;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: blue;' )
			->willReturn( [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'pink' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: blue;',
				'mode'   => 'replace',
			],
		] ) );

		// Assert.
		$by_bp = [];
		foreach ( $captured_variants as $v ) {
			$by_bp[ $v['meta']['breakpoint'] ] = $v;
		}

		$this->assertArrayHasKey( 'mobile', $by_bp );
		$this->assertSame( 'blue', $by_bp['desktop']['props']['color'] );
		$this->assertArrayNotHasKey( 'font-size', $by_bp['desktop']['props'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__null_css_string_removes_breakpoint_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->expects( $this->never() )->method( 'parse_nested' );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'pink' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act — patch mode (default): removal_breakpoints are stripped unconditionally before apply_mode.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--default) { }',
			],
		] ) );

		// Assert.
		$breakpoints = array_column( array_column( $captured_variants, 'meta' ), 'breakpoint' );
		$this->assertNotContains( 'desktop', $breakpoints );
		$this->assertContains( 'mobile', $breakpoints );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__patch_mode_null_prop_deletes_prop() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: null;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: null;' ] ] ] );
		$converter->method( 'convert' )
			->with( '' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: null;',
				'mode'   => 'patch',
			],
		] ) );

		// Assert.
		$this->assertArrayNotHasKey( 'color', $captured_variants[0]['props'] );
		$this->assertSame( '14px', $captured_variants[0]['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__patch_mode_string_null_deletes_prop() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: null;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: null;' ] ] ] );
		$converter->method( 'convert' )
			->with( '' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: null;',
				'mode'   => 'patch',
			],
		] ) );

		// Assert.
		$this->assertArrayNotHasKey( 'color', $captured_variants[0]['props'] );
		$this->assertSame( '14px', $captured_variants[0]['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__replace_mode_discards_existing_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: #fff;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: #fff;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: #fff;' )
			->willReturn( [ 'props' => [ 'color' => '#fff' ], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: #fff;',
				'mode'   => 'replace',
			],
		] ) );

		// Assert.
		$this->assertCount( 1, $captured_variants );
		$this->assertSame( '#fff', $captured_variants[0]['props']['color'] );
		$this->assertArrayNotHasKey( 'font-size', $captured_variants[0]['props'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__mode_defaults_to_patch_when_omitted() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: blue;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: blue;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: blue;' )
			->willReturn( [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'pink' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => 'color: blue;',
			],
		] ) );

		// Assert — patch behaviour: mobile preserved, new desktop variant appended.
		$breakpoints = array_column( array_column( $captured_variants, 'meta' ), 'breakpoint' );
		$this->assertContains( 'mobile', $breakpoints );
		$this->assertContains( 'desktop', $breakpoints );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__styles_null_prop_patch_removes_from_target_breakpoint_only() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: null;' ] ] ] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'green', 'font-size' => '12px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act — patch mobile with null color: should remove color from mobile only.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { color: null; }',
				'mode'   => 'patch',
			],
		] ) );

		// Assert.
		$by_bp = [];
		foreach ( $captured_variants as $v ) {
			$by_bp[ $v['meta']['breakpoint'] ] = $v;
		}
		$this->assertSame( 'red', $by_bp['desktop']['props']['color'] );
		$this->assertArrayNotHasKey( 'color', $by_bp['mobile']['props'] );
		$this->assertSame( '12px', $by_bp['mobile']['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__styles_null_prop_replace_is_ignored() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ] ] ] );
		$converter->method( 'convert' )->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'green' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act — replace mobile with only a null prop: no mobile variant should survive.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { color: null; }',
				'mode'   => 'replace',
			],
		] ) );

		// Assert: desktop preserved; mobile entirely gone (no empty variant stored).
		$breakpoints = array_column( array_column( $captured_variants, 'meta' ), 'breakpoint' );
		$this->assertContains( 'desktop', $breakpoints );
		$this->assertNotContains( 'mobile', $breakpoints );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__styles_null_prop_removes_from_non_desktop_breakpoint() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: null;' ] ] ] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { color: null; }',
				'mode'   => 'patch',
			],
		] ) );

		// Assert: color removed, font-size preserved.
		$this->assertArrayNotHasKey( 'color', $captured_variants[0]['props'] );
		$this->assertSame( '14px', $captured_variants[0]['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__all_null_in_base_wipes_existing_props_then_applies_new() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'all: null; color: blue;' ] ] ] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [ 'color' => 'blue' ], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px', 'padding' => '10px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { all: null; color: blue; }',
				'mode'   => 'patch',
			],
		] ) );

		// Assert: old props gone, only new color survives.
		$this->assertSame( [ 'color' => 'blue' ], $captured_variants[0]['props'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__all_null_in_base_with_no_new_props_removes_variant() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'all: null;' ] ] ] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'green', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { all: null; }',
				'mode'   => 'patch',
			],
		] ) );

		// Assert: mobile base variant gone, desktop untouched.
		$breakpoints = array_column( array_column( $captured_variants, 'meta' ), 'breakpoint' );
		$this->assertContains( 'desktop', $breakpoints );
		$this->assertNotContains( 'mobile', $breakpoints );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__all_null_in_state_block_removes_that_state_variant() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => '' ], [ 'selector' => ':hover', 'css' => 'all: null;' ] ] ] );
		$converter->method( 'convert' )
			->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => null ], 'props' => [ 'color' => 'red' ], 'custom_css' => null ],
			[ 'meta' => [ 'breakpoint' => 'mobile', 'state' => 'hover' ], 'props' => [ 'color' => 'blue' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => '@media(--mobile) { &:hover { all: null; } }',
				'mode'   => 'patch',
			],
		] ) );

		// Assert: hover gone, mobile base preserved.
		$this->assertCount( 1, $captured_variants );
		$this->assertNull( $captured_variants[0]['meta']['state'] );
		$this->assertSame( 'red', $captured_variants[0]['props']['color'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__invalid_mode_returns_error() {
		// Arrange.
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', [] );

		// Act.
		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => [ 'color' => 'red' ],
				'mode'   => 'merge',
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
		$this->assertStringContainsString( 'merge', $result['results'][0]['message'] );
	}

	public function test_batch__unknown_breakpoint_fails_only_that_operation() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: red;' )
			->willReturn( [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] );

		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->once() )->method( 'apply_changes' );

		// Act.
		$result = $this->make_ability_with_breakpoints( [ 'desktop' ], $converter, $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'valid-class',
				'css'    => 'color: red;',
			],
			[
				'action' => 'create',
				'label'  => 'invalid-class',
				'css'    => '@media(--unknown-bp) { color: blue; }',
			],
		] ) );

		// Assert.
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertCount( 2, $result['results'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'error', $result['results'][1]['status'] );
		$this->assertSame( 'invalid_css', $result['results'][1]['code'] );
	}
}

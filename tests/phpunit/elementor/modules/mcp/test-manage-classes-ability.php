<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_REST_API;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Classes_Ability extends TestCase {

	private function assertWPError( $actual ): void {
		$this->assertInstanceOf( \WP_Error::class, $actual );
	}

	private function assertCleanVariants( array $variants ): void {
		foreach ( $variants as $variant ) {
			$this->assertArrayNotHasKey( 'null_props', $variant );
		}
	}

	private function make_ability( ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null ) {
				parent::__construct( $repository );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ self::DESKTOP_BREAKPOINT, 'mobile', 'tablet' ];
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id' => $id,
					'label' => $label,
					'type' => self::CLASS_TYPE,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state' => null,
							],
							'props' => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	private function make_ability_with_converter( ?Global_Classes_Repository $repository, Css_Converter $converter ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository, $converter ) extends Manage_Classes_Ability {
			public function __construct( ?Global_Classes_Repository $repository = null, ?Css_Converter $css_converter = null ) {
				parent::__construct( $repository, $css_converter );
			}

			protected function get_active_breakpoint_keys(): array {
				return [ self::DESKTOP_BREAKPOINT, 'mobile', 'tablet' ];
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id' => $id,
					'label' => $label,
					'type' => self::CLASS_TYPE,
					'variants' => [
						[
							'meta' => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state' => null,
							],
							'props' => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
	}

	private function make_repository_with_existing_class( string $id, array $variants ): Global_Classes_Repository {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ $id => 'test-class' ] );
		$repository->method( 'get_order' )->willReturn( [ $id ] );
		$repository->method( 'get' )->with( $id )->willReturn( [
			'id'       => $id,
			'label'    => 'test-class',
			'type'     => 'class',
			'variants' => $variants,
		] );

		return $repository;
	}

	private function operations_input( array $operations ): array {
		return [ 'operations' => $operations ];
	}

	public function test_execute__requires_operations_array() {
		$result = $this->make_ability()->execute( [] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__rejects_empty_operations() {
		$result = $this->make_ability()->execute( $this->operations_input( [] ) );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__rejects_batch_size_over_limit() {
		$operations = array_fill( 0, Manage_Classes_Ability::MAX_BATCH_SIZE + 1, [
			'action' => 'delete',
			'id' => 'g-abc1234',
		] );

		$result = $this->make_ability()->execute( $this->operations_input( $operations ) );

		$this->assertWPError( $result );
		$this->assertSame( 'batch_size_exceeded', $result->get_error_code() );
	}

	public function test_execute__returns_error_for_unknown_action() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'noop' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_create__requires_label_and_css() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'create', 'label' => 'hero-heading' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_create__delegates_to_repository_and_returns_compact_ok() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with(
				$this->callback( function ( $touched ) {
					$this->assertCount( 1, $touched );
					$item = reset( $touched );
					$this->assertSame( 'hero-heading', $item['label'] );
					$this->assertSame( 'class', $item['type'] );

					return true;
				} ),
				$this->callback( function ( $changes ) {
					$this->assertCount( 1, $changes['added'] );
					$this->assertSame( [], $changes['deleted'] );
					$this->assertSame( [], $changes['modified'] );

					return true;
				} ),
				$this->callback( function ( $order ) {
					$this->assertCount( 1, $order );

					return true;
				} )
			);

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#000000' ],
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'hero-heading', $result['results'][0]['label'] );
		$this->assertNotEmpty( $result['results'][0]['id'] );
		$this->assertArrayNotHasKey( 'class', $result );
		$this->assertArrayNotHasKey( 'variants', $result['results'][0] );
		$this->assertNotEmpty( $result['order'] );
	}

	public function test_create__auto_renames_duplicated_label_with_dup_prefix() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ 'g-existing' => 'hero-heading' ] );
		$repository->method( 'get_order' )->willReturn( [ 'g-existing' ] );
		$repository->expects( $this->once() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#000000' ],
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'DUP_hero-heading', $result['results'][0]['label'] );
		$this->assertSame( 'hero-heading', $result['results'][0]['modified_label']['original'] );
		$this->assertSame( 'DUP_hero-heading', $result['results'][0]['modified_label']['modified'] );
	}

	public function test_bulk__auto_renames_duplicate_label_in_batch() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->expects( $this->once() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#000000' ],
			],
			[
				'action' => 'create',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#ffffff' ],
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'hero-heading', $result['results'][0]['label'] );
		$this->assertArrayNotHasKey( 'modified_label', $result['results'][0] );

		$this->assertSame( 'ok', $result['results'][1]['status'] );
		$this->assertSame( 'DUP_hero-heading', $result['results'][1]['label'] );
		$this->assertSame( 'hero-heading', $result['results'][1]['modified_label']['original'] );
		$this->assertSame( 'DUP_hero-heading', $result['results'][1]['modified_label']['modified'] );
	}

	public function test_create__rejects_when_max_classes_limit_reached() {
		$max_items = Global_Classes_REST_API::MAX_ITEMS;
		$labels_at_limit = [];
		for ( $i = 0; $i < $max_items; $i++ ) {
			$labels_at_limit[ "g-existing-{$i}" ] = "class-{$i}";
		}

		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( $labels_at_limit );
		$repository->method( 'get_order' )->willReturn( array_keys( $labels_at_limit ) );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label' => 'new-class',
				'css' => [ 'color' => '#000000' ],
			],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'global_classes_limit_exceeded', $result['results'][0]['code'] );
	}

	public function test_update__requires_id_label_and_css() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'update', 'label' => 'hero-heading' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_update__maps_not_found() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id' => 'missing',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#ffffff' ],
			],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'class_not_found', $result['results'][0]['code'] );
	}

	public function test_update__delegates_to_repository_and_returns_compact_ok() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'get' )->with( 'g-abc1234' )->willReturn( [
			'id' => 'g-abc1234',
			'label' => 'hero-heading',
			'type' => 'class',
			'variants' => [],
		] );
		$repository->method( 'all_labels' )->willReturn( [ 'g-abc1234' => 'hero-heading' ] );
		$repository->method( 'get_order' )->willReturn( [ 'g-abc1234' ] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with(
				$this->callback( function ( $touched ) {
					$this->assertArrayHasKey( 'g-abc1234', $touched );

					return true;
				} ),
				[
					'added' => [],
					'deleted' => [],
					'modified' => [ 'g-abc1234' ],
					'order' => false,
				],
				[ 'g-abc1234' ]
			);

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id' => 'g-abc1234',
				'label' => 'hero-heading',
				'css' => [ 'color' => '#ffffff' ],
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'g-abc1234', $result['results'][0]['id'] );
		$this->assertArrayNotHasKey( 'variants', $result['results'][0] );
	}

	public function test_delete__requires_id() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'delete' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_delete__maps_not_found() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[ 'action' => 'delete', 'id' => 'missing' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'class_not_found', $result['results'][0]['code'] );
	}

	public function test_delete__success_returns_compact_ok() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ 'g-abc1234' => 'hero-heading' ] );
		$repository->method( 'get_order' )->willReturn( [ 'g-abc1234', 'g-other' ] );
		$repository->method( 'get' )->with( 'g-abc1234' )->willReturn( [
			'id' => 'g-abc1234',
			'label' => 'hero-heading',
			'type' => 'class',
			'variants' => [],
		] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with(
				[],
				[
					'added' => [],
					'deleted' => [ 'g-abc1234' ],
					'modified' => [],
					'order' => true,
				],
				[ 'g-other' ]
			);

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[ 'action' => 'delete', 'id' => 'g-abc1234' ],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'g-abc1234', $result['results'][0]['id'] );
		$this->assertSame( [ 'g-other' ], $result['order'] );
	}

	public function test_create__with_styles_produces_variants() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: red;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: red;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: red;' )
			->willReturn( [ 'props' => [ 'color' => 'red' ], 'customCss' => '', 'rejected' => [] ] );

		$captured_variants = null;
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [] );
		$repository->method( 'get_order' )->willReturn( [] );
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$item = reset( $touched );
			$captured_variants = $item['variants'];
		} );

		// Act.
		$result = $this->make_ability_with_converter( $repository, $converter )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label'  => 'test-class',
				'styles' => [ 'default' => 'color: red;' ],
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
				'styles' => [ 'default' => 'color: red; &:hover { color: blue; }' ],
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

	public function test_create__styles_takes_precedence_over_css() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )
			->with( 'color: new;' )
			->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: new;' ] ] ] );
		$converter->method( 'convert' )
			->with( 'color: new;' )
			->willReturn( [ 'props' => [ 'color' => 'new' ], 'customCss' => '', 'rejected' => [] ] );

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
				'css'    => [ 'color' => 'legacy' ],
				'styles' => [ 'default' => 'color: new;' ],
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'new', $captured_variants[0]['props']['color'] );
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
				'styles' => [ 'default' => 'color: blue;' ],
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
				'styles' => [ 'default' => 'color: blue;' ],
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
				'styles' => [ 'default' => null ],
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
		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => [ 'color' => null ],
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
		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => [ 'color' => 'null' ],
				'mode'   => 'patch',
			],
		] ) );

		// Assert.
		$this->assertArrayNotHasKey( 'color', $captured_variants[0]['props'] );
		$this->assertSame( '14px', $captured_variants[0]['props']['font-size'] );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__replace_mode_ignores_null_prop() {
		// Arrange.
		$existing_variants = [
			[ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red', 'font-size' => '14px' ], 'custom_css' => null ],
		];
		$repository = $this->make_repository_with_existing_class( 'g-abc1234', $existing_variants );

		$captured_variants = null;
		$repository->method( 'apply_changes' )->willReturnCallback( function ( $touched ) use ( &$captured_variants ) {
			$captured_variants = $touched['g-abc1234']['variants'];
		} );

		// Act.
		$this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'update',
				'id'     => 'g-abc1234',
				'label'  => 'test-class',
				'css'    => [ 'color' => '#fff' ],
				'mode'   => 'replace',
			],
		] ) );

		// Assert.
		$this->assertCount( 1, $captured_variants );
		$this->assertSame( '#fff', $captured_variants[0]['props']['color'] );
		$this->assertArrayNotHasKey( 'font-size', $captured_variants[0]['props'] );
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
				'styles' => [ 'default' => 'color: red; &:hover { unclosed' ],
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_css', $result['results'][0]['code'] );
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
				'styles' => [ 'default' => 'color: blue;' ],
			],
		] ) );

		// Assert — patch behaviour: mobile preserved, new desktop variant appended.
		$breakpoints = array_column( array_column( $captured_variants, 'meta' ), 'breakpoint' );
		$this->assertContains( 'mobile', $breakpoints );
		$this->assertContains( 'desktop', $breakpoints );
		$this->assertCount( 2, $captured_variants );
		$this->assertCleanVariants( $captured_variants );
	}

	public function test_update__styles_null_prop_patch_removes_from_target_breakpoint_only() {
		// Arrange.
		$converter = $this->createMock( Css_Converter::class );
		$converter->method( 'parse_nested' )->willReturn( [ 'blocks' => [ [ 'selector' => null, 'css' => 'color: null;' ] ] ] );
		$converter->method( 'convert' )->willReturn( [ 'props' => [], 'customCss' => '', 'rejected' => [] ] );

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
				'styles' => [ 'mobile' => 'color: null;' ],
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
				'styles' => [ 'mobile' => 'color: null;' ],
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
				'styles' => [ 'mobile' => 'color: null;' ],
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
				'styles' => [ 'mobile' => 'all: null; color: blue;' ],
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
				'styles' => [ 'mobile' => 'all: null;' ],
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
				'styles' => [ 'mobile' => '&:hover { all: null; }' ],
				'mode'   => 'patch',
			],
		] ) );

		// Assert: hover gone, mobile base preserved.
		$this->assertCount( 1, $captured_variants );
		$this->assertNull( $captured_variants[0]['meta']['state'] );
		$this->assertSame( 'red', $captured_variants[0]['props']['color'] );
		$this->assertCleanVariants( $captured_variants );
	}

	private function make_ability_with_breakpoints( array $breakpoints, ?Css_Converter $converter = null, ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		if ( null === $repository ) {
			$repository = $this->createMock( Global_Classes_Repository::class );
			$repository->method( 'all_labels' )->willReturn( [] );
			$repository->method( 'get_order' )->willReturn( [] );
		}

		return new class( $repository, $converter, $breakpoints ) extends Manage_Classes_Ability {
			private array $breakpoint_keys;

			public function __construct( ?Global_Classes_Repository $repository, ?Css_Converter $css_converter, array $breakpoint_keys ) {
				parent::__construct( $repository, $css_converter );
				$this->breakpoint_keys = $breakpoint_keys;
			}

			protected function get_active_breakpoint_keys(): array {
				return $this->breakpoint_keys;
			}

			protected function build_class_item( string $id, string $label, array $css ) {
				return [
					'id'       => $id,
					'label'    => $label,
					'type'     => self::CLASS_TYPE,
					'variants' => [
						[
							'meta'       => [
								'breakpoint' => self::DESKTOP_BREAKPOINT,
								'state'      => null,
							],
							'props'      => $css,
							'custom_css' => null,
						],
					],
				];
			}
		};
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
				'styles' => [ 'tablet' => 'color: red;' ],
			],
		] ) );

		// Assert.
		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'unknown_breakpoint', $result['results'][0]['code'] );
		$this->assertStringContainsString( 'tablet', $result['results'][0]['message'] );
		$this->assertStringContainsString( 'desktop', $result['results'][0]['message'] );
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
				'styles' => [ 'default' => '&:hover {}' ],
			],
		] ) );

		// Assert — operation succeeds; no hover variant created for the empty block.
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
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
				'styles' => [ 'default' => 'color: red;' ],
			],
		] ) );

		// Assert.
		$this->assertSame( 'ok', $result['status'] );
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
				'styles' => [ 'default' => 'color: red;' ],
			],
			[
				'action' => 'create',
				'label'  => 'invalid-class',
				'styles' => [ 'unknown-bp' => 'color: blue;' ],
			],
		] ) );

		// Assert.
		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertCount( 2, $result['results'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'error', $result['results'][1]['status'] );
		$this->assertSame( 'unknown_breakpoint', $result['results'][1]['code'] );
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
				'styles' => [
					'default' => 'color: red;',
					'mobile'  => 'color: pink;',
				],
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
				'styles' => [ 'default' => 'color: red; &:disabled { color: grey; }' ],
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
				'styles' => [ 'default' => 'color: red; &:hover { color: blue; } &:disabled { color: grey; } &.my-class { font-weight: bold; }' ],
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
				'styles' => [ 'default' => '&:disabled { color: grey; }' ],
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

	public function test_bulk__applies_create_update_delete_in_single_commit() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ 'g-update' => 'update-me' ] );
		$repository->method( 'get_order' )->willReturn( [ 'g-update', 'g-delete' ] );
		$repository->method( 'get' )->willReturnCallback( function ( $id ) {
			if ( 'g-update' === $id ) {
				return [
					'id' => 'g-update',
					'label' => 'update-me',
					'type' => 'class',
					'variants' => [],
				];
			}

			if ( 'g-delete' === $id ) {
				return [
					'id' => 'g-delete',
					'label' => 'delete-me',
					'type' => 'class',
					'variants' => [],
				];
			}

			return null;
		} );
		$repository->expects( $this->once() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'label' => 'new-class',
				'css' => [ 'color' => '#000000' ],
			],
			[
				'action' => 'update',
				'id' => 'g-update',
				'label' => 'updated-class',
				'css' => [ 'color' => '#111111' ],
			],
			[
				'action' => 'delete',
				'id' => 'g-delete',
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertCount( 3, $result['results'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'ok', $result['results'][1]['status'] );
		$this->assertSame( 'ok', $result['results'][2]['status'] );
	}
}

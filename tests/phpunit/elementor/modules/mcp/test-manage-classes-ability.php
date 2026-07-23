<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

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

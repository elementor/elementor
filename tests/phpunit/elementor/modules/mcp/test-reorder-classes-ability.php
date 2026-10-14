<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Reorder_Classes_Ability;
use PHPUnit\Framework\TestCase;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Reorder_Classes_Ability extends TestCase {

	private function make_ability( Global_Classes_Repository $repository ): Reorder_Classes_Ability {
		return new Reorder_Classes_Ability( $repository );
	}

	private function make_repository( array $order ): Global_Classes_Repository {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'get_order' )->willReturn( $order );

		return $repository;
	}

	public function test_execute__moves_class_before_reference_and_persists_order() {
		$repository = $this->make_repository( [ 'g-base', 'g-heading', 'g-accent' ] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with(
				[],
				[
					'added' => [],
					'deleted' => [],
					'modified' => [],
					'order' => true,
				],
				[ 'g-accent', 'g-base', 'g-heading' ]
			);

		$result = $this->make_ability( $repository )->execute( [
			'moves' => [
				[
					'id' => 'g-accent',
					'position' => 'before',
					'ref' => 'g-base',
				],
			],
		] );

		$this->assertTrue( $result['changed'] );
		$this->assertSame( [ 'g-accent', 'g-base', 'g-heading' ], $result['order'] );
	}

	public function test_execute__applies_moves_sequentially() {
		$repository = $this->make_repository( [ 'g-a', 'g-b', 'g-c' ] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with( [], $this->anything(), [ 'g-c', 'g-b', 'g-a' ] );

		$result = $this->make_ability( $repository )->execute( [
			'moves' => [
				[ 'id' => 'g-c', 'position' => 'before', 'ref' => 'g-a' ],
				[ 'id' => 'g-b', 'position' => 'after', 'ref' => 'g-c' ],
			],
		] );

		$this->assertSame( [ 'g-c', 'g-b', 'g-a' ], $result['order'] );
	}

	public function test_execute__returns_noop_without_persisting_when_order_is_unchanged() {
		$repository = $this->make_repository( [ 'g-a', 'g-b' ] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( [
			'moves' => [
				[ 'id' => 'g-a', 'position' => 'start' ],
			],
		] );

		$this->assertFalse( $result['changed'] );
		$this->assertSame( [ 'g-a', 'g-b' ], $result['order'] );
	}

	public function test_execute__moves_class_to_end() {
		$repository = $this->make_repository( [ 'g-a', 'g-b', 'g-c' ] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with( [], $this->anything(), [ 'g-b', 'g-c', 'g-a' ] );

		$result = $this->make_ability( $repository )->execute( [
			'moves' => [
				[ 'id' => 'g-a', 'position' => 'end' ],
			],
		] );

		$this->assertSame( [ 'g-b', 'g-c', 'g-a' ], $result['order'] );
	}

	public function test_execute__rejects_unknown_class_id() {
		$repository = $this->make_repository( [ 'g-a', 'g-b' ] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		$result = $this->make_ability( $repository )->execute( [
			'moves' => [
				[ 'id' => 'g-missing', 'position' => 'start' ],
			],
		] );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'class_not_found', $result->get_error_code() );
	}

	public function test_execute__appends_omitted_ids_to_full_order() {
		$repository = $this->make_repository( [ 'g-a', 'g-b', 'g-c' ] );
		$repository->expects( $this->once() )
			->method( 'apply_changes' )
			->with( [], $this->anything(), [ 'g-c', 'g-a', 'g-b' ] );

		$result = $this->make_ability( $repository )->execute( [
			'order' => [ 'g-c', 'g-a' ],
		] );

		$this->assertSame( [ 'g-b' ], $result['appended_ids'] );
		$this->assertSame( [ 'g-c', 'g-a', 'g-b' ], $result['order'] );
	}

	public function test_execute__rejects_moves_and_order_together() {
		$repository = $this->make_repository( [ 'g-a' ] );

		$result = $this->make_ability( $repository )->execute( [
			'order' => [ 'g-a' ],
			'moves' => [ [ 'id' => 'g-a', 'position' => 'start' ] ],
		] );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}

	public function test_execute__rejects_more_than_max_moves() {
		$repository = $this->make_repository( [ 'g-a', 'g-b' ] );
		$repository->expects( $this->never() )->method( 'apply_changes' );

		$moves = array_fill( 0, Reorder_Classes_Ability::MAX_MOVES + 1, [
			'id' => 'g-a',
			'position' => 'start',
		] );

		$result = $this->make_ability( $repository )->execute( [
			'moves' => $moves,
		] );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
	}
}

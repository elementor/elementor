<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Manage_Classes_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Classes_Ability extends Elementor_Test_Base {

	private function make_ability( ?Global_Classes_Repository $repository = null ): Manage_Classes_Ability {
		return new Manage_Classes_Ability( $repository ?? $this->createMock( Global_Classes_Repository::class ) );
	}

	public function test_execute__returns_error_for_unknown_action() {
		$result = $this->make_ability()->execute( [ 'action' => 'noop' ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_create__requires_label_and_css() {
		$result = $this->make_ability()->execute( [ 'action' => 'create', 'label' => 'hero-heading' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_create__delegates_to_repository_and_returns_ok() {
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

		$result = $this->make_ability( $repository )->execute( [
			'action' => 'create',
			'label' => 'hero-heading',
			'css' => [ 'color' => '#000000' ],
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'hero-heading', $result['class']['label'] );
		$this->assertNotEmpty( $result['class']['id'] );
		$this->assertNotEmpty( $result['order'] );
	}

	public function test_create__maps_duplicated_label() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [ 'g-existing' => 'hero-heading' ] );
		$repository->method( 'get_order' )->willReturn( [ 'g-existing' ] );

		$result = $this->make_ability( $repository )->execute( [
			'action' => 'create',
			'label' => 'hero-heading',
			'css' => [ 'color' => '#000000' ],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'duplicated_label', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_update__requires_id_label_and_css() {
		$result = $this->make_ability()->execute( [ 'action' => 'update', 'label' => 'hero-heading' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_update__maps_not_found() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'get' )->with( 'missing' )->willReturn( null );

		$result = $this->make_ability( $repository )->execute( [
			'action' => 'update',
			'id' => 'missing',
			'label' => 'hero-heading',
			'css' => [ 'color' => '#ffffff' ],
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'class_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_update__delegates_to_repository_and_returns_ok() {
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

		$result = $this->make_ability( $repository )->execute( [
			'action' => 'update',
			'id' => 'g-abc1234',
			'label' => 'hero-heading',
			'css' => [ 'color' => '#ffffff' ],
		] );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'g-abc1234', $result['class']['id'] );
	}

	public function test_delete__requires_id() {
		$result = $this->make_ability()->execute( [ 'action' => 'delete' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_delete__maps_not_found() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'get_order' )->willReturn( [] );

		$result = $this->make_ability( $repository )->execute( [ 'action' => 'delete', 'id' => 'missing' ] );

		$this->assertWPError( $result );
		$this->assertSame( 'class_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_delete__success_returns_ok() {
		$repository = $this->createMock( Global_Classes_Repository::class );
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

		$result = $this->make_ability( $repository )->execute( [ 'action' => 'delete', 'id' => 'g-abc1234' ] );

		$this->assertIsArray( $result );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'g-abc1234', $result['class']['id'] );
		$this->assertSame( [ 'g-other' ], $result['order'] );
	}

	public function test_permission_callback__requires_update_class_capability() {
		$ability = $this->make_ability();
		$definition = ( new \ReflectionClass( $ability ) )->getMethod( 'get_definition' );
		$definition->setAccessible( true );
		$permission = $definition->invoke( $ability )->to_array()['permission_callback'];

		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$this->assertFalse( $permission() );

		$this->act_as_admin();
		get_role( 'administrator' )->add_cap( Add_Capabilities::UPDATE_CLASS );
		$this->assertTrue( $permission() );
	}
}

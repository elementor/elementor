<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Variable_Ability extends Elementor_Test_Base {

	private function make_ability( ?Variables_Service $service = null ): Manage_Variable_Ability {
		return new Manage_Variable_Ability( $service ?? $this->createMock( Variables_Service::class ) );
	}

	public function test_execute__returns_error_for_unknown_action() {
		$result = $this->make_ability()->execute( [ 'action' => 'noop' ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	// create

	public function test_create__requires_type_label_and_value() {
		$result = $this->make_ability()->execute( [ 'action' => 'create', 'type' => 'global-color-variable' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_create__delegates_to_service_and_returns_ok() {
		$service = $this->createMock( Variables_Service::class );
		$service->expects( $this->once() )
			->method( 'create' )
			->with( [ 'type' => 'global-color-variable', 'label' => 'brand', 'value' => '#000' ] )
			->willReturn( [
				'variable' => [ 'id' => 'abc', 'label' => 'brand', 'value' => '#000', 'type' => 'global-color-variable' ],
				'watermark' => 7,
			] );

		$result = $this->make_ability( $service )->execute( [
			'action' => 'create',
			'type' => 'global-color-variable',
			'label' => 'brand',
			'value' => '#000',
		] );

		$this->assertIsArray( $result );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'abc', $result['variable']['id'] );
		$this->assertSame( 7, $result['watermark'] );
	}

	public function test_create__maps_duplicated_label_exception() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'create' )->willThrowException( new DuplicatedLabel( 'dup' ) );

		$result = $this->make_ability( $service )->execute( [
			'action' => 'create',
			'type' => 'global-color-variable',
			'label' => 'brand',
			'value' => '#000',
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'duplicated_label', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	// update

	public function test_update__requires_id_label_and_value() {
		$result = $this->make_ability()->execute( [ 'action' => 'update', 'label' => 'x', 'value' => '#000' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_update__delegates_to_service_and_returns_ok() {
		$service = $this->createMock( Variables_Service::class );
		$service->expects( $this->once() )
			->method( 'update' )
			->with( 'abc', [ 'label' => 'brand-2', 'value' => '#fff' ] )
			->willReturn( [
				'variable' => [ 'id' => 'abc', 'label' => 'brand-2', 'value' => '#fff' ],
				'watermark' => 8,
			] );

		$result = $this->make_ability( $service )->execute( [
			'action' => 'update',
			'id' => 'abc',
			'label' => 'brand-2',
			'value' => '#fff',
		] );

		$this->assertSame( 'ok', $result['status'] );
	}

	public function test_update__maps_not_found_exception() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'update' )->willThrowException( new RecordNotFound( 'nope' ) );

		$result = $this->make_ability( $service )->execute( [
			'action' => 'update',
			'id' => 'missing',
			'label' => 'brand',
			'value' => '#000',
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'variable_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	// delete

	public function test_delete__requires_id() {
		$result = $this->make_ability()->execute( [ 'action' => 'delete' ] );

		$this->assertWPError( $result );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_delete__success_returns_ok_and_watermark() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'delete' )->willReturn( [
			'watermark' => 9,
			'variable' => [ 'id' => 'abc', 'deleted' => true ],
		] );

		$result = $this->make_ability( $service )->execute( [ 'action' => 'delete', 'id' => 'abc' ] );

		$this->assertIsArray( $result );
		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 9, $result['watermark'] );
	}
}

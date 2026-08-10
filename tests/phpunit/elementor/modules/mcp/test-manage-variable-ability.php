<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Variable_Ability extends TestCase {

	private function assertWPError( $actual ): void {
		$this->assertInstanceOf( \WP_Error::class, $actual );
	}

	private function make_ability( ?Variables_Service $service = null ): Manage_Variable_Ability {
		return new Manage_Variable_Ability( $service ?? $this->createMock( Variables_Service::class ) );
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
		$operations = array_fill( 0, Manage_Variable_Ability::MAX_BATCH_SIZE + 1, [
			'action' => 'delete',
			'id' => 'abc',
		] );

		$result = $this->make_ability()->execute( $this->operations_input( $operations ) );

		$this->assertWPError( $result );
		$this->assertSame( 'batch_size_exceeded', $result->get_error_code() );
		$this->assertSame( Manage_Variable_Ability::MAX_BATCH_SIZE, $result->get_error_data()['max_allowed'] );
	}

	public function test_execute__returns_error_for_unknown_action() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'noop' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_create__requires_type_label_and_value() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'create', 'type' => 'global-color-variable' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_create__delegates_to_service_and_returns_compact_ok() {
		$service = $this->createMock( Variables_Service::class );
		$service->expects( $this->once() )
			->method( 'process_batch' )
			->with(
				[
					[
						'type' => 'create',
						'variable' => [
							'type' => 'global-color-variable',
							'label' => 'brand',
							'value' => '#000',
						],
					],
				],
				true
			)
			->willReturn( [
				'success' => true,
				'results' => [
					[
						'index' => 0,
						'status' => 'ok',
						'action' => 'create',
						'id' => 'abc',
						'label' => 'brand',
					],
				],
				'watermark' => 7,
			] );

		$result = $this->make_ability( $service )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'type' => 'global-color-variable',
				'label' => 'brand',
				'value' => '#000',
			],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 'abc', $result['results'][0]['id'] );
		$this->assertSame( 'brand', $result['results'][0]['label'] );
		$this->assertArrayNotHasKey( 'variable', $result );
		$this->assertArrayNotHasKey( 'value', $result['results'][0] );
		$this->assertSame( 7, $result['watermark'] );
	}

	public function test_create__maps_duplicated_label_to_per_operation_error() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'success' => false,
			'results' => [
				[
					'index' => 0,
					'status' => 'error',
					'action' => 'create',
					'code' => 'duplicated_label',
					'message' => 'Variable label already exists',
				],
			],
			'watermark' => 5,
		] );

		$result = $this->make_ability( $service )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'type' => 'global-color-variable',
				'label' => 'brand',
				'value' => '#000',
			],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'duplicated_label', $result['results'][0]['code'] );
	}

	public function test_bulk__returns_partial_error_when_mixed_results() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'success' => true,
			'results' => [
				[
					'index' => 0,
					'status' => 'ok',
					'action' => 'create',
					'id' => 'abc',
					'label' => 'brand',
				],
				[
					'index' => 1,
					'status' => 'error',
					'action' => 'update',
					'id' => 'missing',
					'code' => 'variable_not_found',
					'message' => 'Variable not found',
				],
			],
			'watermark' => 8,
		] );

		$result = $this->make_ability( $service )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'type' => 'global-color-variable',
				'label' => 'brand',
				'value' => '#000',
			],
			[
				'action' => 'update',
				'id' => 'missing',
				'label' => 'brand',
				'value' => '#fff',
			],
		] ) );

		$this->assertSame( 'partial_error', $result['status'] );
		$this->assertSame( 'ok', $result['results'][0]['status'] );
		$this->assertSame( 'error', $result['results'][1]['status'] );
	}

	public function test_update__requires_id_label_and_value() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'update', 'label' => 'x', 'value' => '#000' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_delete__requires_id() {
		$result = $this->make_ability()->execute( $this->operations_input( [
			[ 'action' => 'delete' ],
		] ) );

		$this->assertSame( 'error', $result['status'] );
		$this->assertSame( 'invalid_input', $result['results'][0]['code'] );
	}

	public function test_delete__success_returns_ok_and_watermark() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willReturn( [
			'success' => true,
			'results' => [
				[
					'index' => 0,
					'status' => 'ok',
					'action' => 'delete',
					'id' => 'abc',
				],
			],
			'watermark' => 9,
		] );

		$result = $this->make_ability( $service )->execute( $this->operations_input( [
			[ 'action' => 'delete', 'id' => 'abc' ],
		] ) );

		$this->assertSame( 'ok', $result['status'] );
		$this->assertSame( 9, $result['watermark'] );
	}

	public function test_bulk__maps_fatal_error_to_wp_error() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'process_batch' )->willThrowException( new FatalError( 'Failed to save batch operations' ) );

		$result = $this->make_ability( $service )->execute( $this->operations_input( [
			[
				'action' => 'create',
				'type' => 'global-color-variable',
				'label' => 'brand',
				'value' => '#000',
			],
		] ) );

		$this->assertWPError( $result );
		$this->assertSame( 'unexpected_server_error', $result->get_error_code() );
	}
}

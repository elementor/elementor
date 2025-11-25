<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;

class Batch_Processor {
	private const OPERATION_MAP = [
		'create'  => 'op_create',
		'update'  => 'op_update',
		'delete'  => 'op_delete',
		'restore' => 'op_restore',
	];

	private Variables_Service $service;

	public function __construct( Variables_Service $service ) {
		$this->service = $service;
	}

	/**
	 * @throws BatchOperationFailed Thrown when one of the operations fails.
	 * @throws FatalError Failed to save after batch.
	 */
	public function process_batch( array $operations ) {
		$collection = $this->service->get_collection();
		$results = [];
		$errors = [];

		$error_formatter = new Batch_Error_Formatter();

		foreach ( $operations as $index => $operation ) {
			try {
				$results[] = $this->apply_operation( $collection, $operation );

			} catch ( \Exception $e ) {
				$errors[ $this->operation_id( $operation, $index ) ] = [
					'status' => $error_formatter->status_for( $e ),
					'code' => $error_formatter->error_code_for( $e ),
					'message' => $e->getMessage(),
				];
			}
		}

		if ( ! empty( $errors ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new BatchOperationFailed( 'Batch failed', $errors );
		}

		$watermark = $this->service->save_collection( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to save batch operations' );
		}

		return [
			'success'   => true,
			'results'   => $results,
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws BatchOperationFailed Invalid operation type.
	 */
	private function apply_operation( Variables_Collection $collection, array $operation ): array {
		$type = $operation['type'];

		if ( ! isset( self::OPERATION_MAP[ $type ] ) ) {
			throw new BatchOperationFailed( 'Invalid operation type: ' . esc_html( $type ), [] );
		}

		$method = self::OPERATION_MAP[ $type ];

		return $this->$method( $collection, $operation );
	}

	private function op_create( Variables_Collection $collection, array $operation ): array {
		$data = $operation['variable'];
		$temp_id = $data['id'] ?? null;

		$collection->assert_limit_not_reached();
		$collection->assert_label_is_unique( $data['label'] );

		$data['id'] = $collection->next_id();

		if ( ! isset( $data['order'] ) ) {
			$data['order'] = $collection->get_next_order();
		}

		$now = gmdate( 'Y-m-d H:i:s' );
		$data['created_at'] = $now;
		$data['updated_at'] = $now;

		$variable = Variable::from_array( $data );

		$collection->add_variable( $variable );

		// TODO: do we need to return all this payload maybe return what the clients want
		return [
			'type' => 'create',
			'id' => $data['id'],
			'temp_id' => $temp_id,
			'variable' => $variable->to_array(),
		];
	}

	private function op_update( Variables_Collection $collection, array $operation ): array {
		$id = $operation['id'];
		$data = $operation['variable'];

		$variable = $this->service->find_or_fail( $collection, $id );

		if ( isset( $data['label'] ) ) {
			$collection->assert_label_is_unique( $data['label'], $id );
		}

		$variable->apply_changes( $data );

		return [
			'type' => 'update',
			'id' => $id,
			'variable' => $variable->to_array(),
		];
	}

	private function op_delete( Variables_Collection $collection, array $operation ): array {
		$id = $operation['id'];
		$variable = $this->service->find_or_fail( $collection, $id );

		$variable->soft_delete();

		return [
			'type' => 'delete',
			'id' => $id,
			'deleted' => true,
		];
	}

	private function op_restore( Variables_Collection $collection, array $operation ): array {
		$id = $operation['id'];
		$variable = $this->service->find_or_fail( $collection, $id );

		$collection->assert_limit_not_reached();

		if ( isset( $operation['label'] ) ) {
			$collection->assert_label_is_unique( $operation['label'], $id );
		}

		$variable->apply_changes( $operation );

		$variable->restore();

		return [
			'type' => 'restore',
			'id' => $id,
			'variable' => $variable->to_array(),
		];
	}

	private function operation_id( array $operation, int $index ): string {
		if ( 'create' === $operation['type'] && isset( $operation['variable']['id'] ) ) {
			return $operation['variable']['id'];
		}

		if ( isset( $operation['id'] ) ) {
			return $operation['id'];
		}

		return "operation_{$index}";
	}
}

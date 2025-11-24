<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;

class BatchProcessor {
	private const OPERATION_MAP = [
		'create'  => 'op_create',
		'update'  => 'op_update',
		'delete'  => 'op_delete',
		'restore' => 'op_restore',
	];

	private Variables_Repository $repo;
	private Variables_Service $service;

	public function __construct( Variables_Repository $repo, Variables_Service $service ) {
		$this->repo = $repo;
		$this->service = $service;
	}

	/**
	 * @throws BatchOperationFailed Thrown when one of the operations fails.
	 */
	public function process_batch( array $operations ) {
		$collection = $this->repo->load();
		$results = [];
		$errors = [];

		$error_formatter = new BatchErrorFormatter();

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
			throw new BatchOperationFailed( 'Batch failed', $errors );
		}

		$watermark = $this->repo->save( $collection );

		if ( false === $watermark ) {
			throw new \RuntimeException( 'Failed to save after batch.' );
		}

		return [
			'success'   => true,
			'results'   => $results,
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws BatchOperationFailed
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

		$id = $collection->next_id();

		$variable = Variable::from_array( array_merge( [ 'id' => $id ], $data ) );

		$collection->add_variable( $variable );

		// TODO: do we need to return all this payload maybe return what the clients want
		return [
			'type' => 'create',
			'id' => $id,
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

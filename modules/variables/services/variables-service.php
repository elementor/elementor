<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Error_Formatter;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;

class Variables_Service {
	private Variables_Repository $repo;
	private Batch_Processor $batch_processor;

	public function __construct( Variables_Repository $repository, Batch_Processor $batch_processor ) {
		$this->repo = $repository;
		$this->batch_processor = $batch_processor;
	}

	public function get_variables_list(): array {
		return $this->load()['data'];
	}

	public function load() {
		return $this->repo->load()->serialize( true );
	}

	/**
	 * @throws BatchOperationFailed Thrown when one of the operations fails.
	 * @throws FatalError Failed to save after batch.
	 */
	public function process_batch( array $operations ) {
		$collection = $this->repo->load();
		$results = [];
		$errors = [];

		$error_formatter = new Batch_Error_Formatter();

		foreach ( $operations as $index => $operation ) {
			try {
				$results[] = $this->batch_processor->apply_operation( $collection, $operation );

			} catch ( \Exception $e ) {
				$errors[ $this->batch_processor->operation_id( $operation, $index ) ] = [
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

		$watermark = $this->repo->save( $collection );

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
	 * @throws FatalError If variable create fails or validation errors occur.
	 */
	public function create( array $data ): array {
		$collection = $this->repo->load();

		$collection->assert_limit_not_reached();
		$collection->assert_label_is_unique( $data['label'] );

		$id = $collection->next_id();
		$data['id'] = $id;

		// TODO: we need to look into this maybe we dont need order to be sent from client. Just implemented as it was
		if ( ! isset( $data['order'] ) ) {
			$data['order'] = $collection->get_next_order();
		}

		$variable = Variable::from_array( $data );

		$collection->add_variable( $variable );

		$watermark = $this->repo->save( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to create variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $collection->watermark(),
		];
	}

	/**
	 * @throws FatalError If variable update fails.
	 */
	public function update( string $id, array $data ): array {
		$collection = $this->repo->load();
		$variable = $collection->find_or_fail( $id );

		if ( isset( $data['label'] ) ) {
			$collection->assert_label_is_unique( $data['label'], $id );
		}

		$variable->apply_changes( $data );

		$watermark = $this->repo->save( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to update variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws FatalError If variable delete fails.
	 */
	public function delete( string $id ) {
		$collection = $this->repo->load();
		$variable = $collection->find_or_fail( $id );

		$variable->soft_delete();

		$watermark = $this->repo->save( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to delete variable' );
		}

		return [
			'watermark' => $watermark,
			'variable' => array_merge( [
				'id' => $id,
				'deleted' => true,
			], $variable->to_array() ),
		];
	}

	/**
	 * @throws FatalError If variable restore fails.
	 */
	public function restore( string $id, $overrides = [] ) {
		$collection = $this->repo->load();
		$variable = $collection->find_or_fail( $id );

		$collection->assert_limit_not_reached();

		if ( isset( $overrides['label'] ) ) {
			$collection->assert_label_is_unique( $overrides['label'], $variable->id() );
		}

		$variable->apply_changes( $overrides );

		$variable->restore();

		$watermark = $this->repo->save( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to delete variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $watermark,
		];
	}
}

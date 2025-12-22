<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;

class Batch_Processor {
	private const OPERATION_MAP = [
		'create'  => 'op_create',
		'update'  => 'op_update',
		'delete'  => 'op_delete',
		'restore' => 'op_restore',
	];

	/**
	 * @throws BatchOperationFailed Invalid operation type.
	 */
	public function apply_operation( Variables_Collection $collection, array $operation ): array {
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
		$data['id'] = $collection->next_id();

		$collection->assert_limit_not_reached();
		$collection->assert_label_is_unique( $data['label'] );

		if ( ! isset( $data['order'] ) ) {
			$data['order'] = $collection->get_next_order();
		}

		$variable = Variable::create_new( $data );

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

		$variable = $collection->find_or_fail( $id );

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
		$variable = $collection->find_or_fail( $id );

		$variable->soft_delete();

		return [
			'type' => 'delete',
			'id' => $id,
			'deleted' => true,
		];
	}

	private function op_restore( Variables_Collection $collection, array $operation ): array {
		$id = $operation['id'];
		$variable = $collection->find_or_fail( $id );

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

	public function operation_id( array $operation, int $index ): string {
		if ( 'create' === $operation['type'] && isset( $operation['variable']['id'] ) ) {
			return $operation['variable']['id'];
		}

		if ( isset( $operation['id'] ) ) {
			return $operation['id'];
		}

		return "operation_{$index}";
	}
}

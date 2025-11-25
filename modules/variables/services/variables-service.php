<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;

class Variables_Service {
	private Variables_Repository $repo;

	public function __construct( Variables_Repository $repository ) {
		$this->repo = $repository;
	}

	public function get_variables_list(): array {
		return $this->load()['data'];
	}

	public function load() {
		return $this->get_collection()->serialize();
	}

	public function get_collection(): Variables_Collection {
		return $this->repo->load();
	}

	public function save_collection( Variables_Collection $collection ) {
		return $this->repo->save( $collection );
	}

	/**
	 * @throws FatalError If variable create fails or validation errors occur.
	 */
	public function create( array $data ): array {
		$collection = $this->get_collection();

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

		$watermark = $this->save_collection( $collection );

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
		$collection = $this->get_collection();
		$variable = $this->find_or_fail( $collection, $id );

		if ( isset( $data['label'] ) ) {
			$collection->assert_label_is_unique( $data['label'], $id );
		}

		$variable->apply_changes( $data );

		$watermark = $this->save_collection( $collection );

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
		$collection = $this->get_collection();
		$variable = $this->find_or_fail( $collection, $id );

		$variable->soft_delete();

		$watermark = $this->save_collection( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to delete variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws FatalError If variable restore fails.
	 */
	public function restore( string $id, $overrides = [] ) {
		$collection = $this->get_collection();
		$variable = $this->find_or_fail( $collection, $id );

		$collection->assert_limit_not_reached();

		if ( isset( $overrides['label'] ) ) {
			$collection->assert_label_is_unique( $overrides['label'], $variable->id() );
		}

		$variable->apply_changes( $overrides );

		$variable->restore();

		$watermark = $this->save_collection( $collection );

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to delete variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $watermark,
		];
	}

	/**
	 * @throws RecordNotFound When a variable is not found.
	 */
	public function find_or_fail( Variables_Collection $collection, string $id ): Variable {
		$variable = $collection->get( $id );

		if ( ! isset( $variable ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		return $variable;
	}
}

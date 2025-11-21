<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;

class Variables_Service {
	private Variables_Repository $repo;

	public function __construct( Variables_Repository $repository ) {
		$this->repo = $repository;
	}

	/**
	 * @throws FatalError If variable create fails or validation errors occur.
	 */
	public function create( array $data ): array {
		$collection = $this->repo->load();

		$collection->assert_label_is_unique( $data['label'] );
		$collection->assert_limit_not_reached();

		$id = $this->repo->next_id();

		$variable = Variable::from_array( array_merge( [ 'id' => $id ], $data ) );

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
	 * @throws RecordNotFound WHen variable is not found.
	 */
	public function update( string $id, array $data ): array {
		$collection = $this->repo->load();

		$variable = $collection->get( $id );

		if ( ! isset( $variable ) ) {
			throw new RecordNotFound( 'Variable not found' );
		}

		if ( isset( $data['label'] ) ) {
			$collection->assert_label_is_unique( $data['label'], $id );
		}

		$variable->apply_changes( $data );

		$watermark = $this->repo->save($collection);

		if ( false === $watermark ) {
			throw new FatalError( 'Failed to update variable' );
		}

		return [
			'variable' => array_merge( [ 'id' => $id ], $variable->to_array() ),
			'watermark' => $watermark,
		];
	}
}

<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

class Diagnostics {

	/**
	 * @var Diagnosable[]
	 */
	protected $diagnosables;

	/**
	 * The Diagnostics constructor.
	 *
	 * @param $diagnosables
	 *
	 * @return void
	 */
	public function __construct( $diagnosables ) {
		$this->diagnosables = $diagnosables;
	}

	/**
	 * Return all successful diagnosables.
	 *
	 * @return Diagnosable[]
	 */
	public function successful() {
		return array_filter(
			$this->diagnosables,
			function( $diagnosable ) {
				return ! $diagnosable->error();
			}
		);
	}

	/**
	 * Return all diagnosables that ended up with a failure.
	 *
	 * @return Diagnosable[]
	 */
	public function failed() {
		return array_filter(
			$this->diagnosables,
			function( $diagnosable ) {
				return $diagnosable->error();
			}
		);
	}

	/**
	 * @param Diagnosable[] $diagnosables
	 *
	 * @return array
	 */
	public function recursive_serialize( $diagnosables = [] ) {
		$serialized = [];

		foreach( $diagnosables as $key => $diagnosable ) {
			$serialized[] = [
				'id' => $key,
				'name' => $diagnosable->get_name(),
				'result' => ! $diagnosable->error(),
				'error' => $diagnosable->error() ?
					$diagnosable->error()->getMessage() :
					null,
				'diagnosables' => $this->recursive_serialize( $diagnosable->get_diagnosables() )
			];
		}

		return $serialized;
	}

	public function to_array() {
		return $this->recursive_serialize( $this->diagnosables );
	}
}

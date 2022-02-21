<?php

namespace Elementor\Core\Utils\Testing;

use Elementor\Core\Utils\Testing\Interfaces\Diagnosable;

class Diagnostics {

	/**
	 * A list of diagnosable to diagnose.
	 *
	 * @var Diagnosable
	 */
	protected $diagnosable;

	/**
	 * A list of diagnostics objects for the given diagnosables.
	 *
	 * @var Diagnostics[]
	 */
	protected $diagnostics = [];

	/**
	 * The Diagnostics constructor.
	 *
	 * @param Diagnosable $diagnosable
	 *
	 * @return void
	 */
	public function __construct( $diagnosable ) {
		$this->diagnosable = $diagnosable;

		$this->build();
	}

	/**
	 * Retrieve the diagnosable instance being diagnosed.
	 *
	 * @return Diagnosable
	 */
	public function get_diagnosable() {
		return $this->diagnosable;
	}

	/**
	 * Return diagnostics for all diagnosables.
	 *
	 * @return Diagnostics[]
	 */
	public function all() {
		return $this->diagnostics;
	}

	/**
	 * Return diagnostics for all successful diagnosables.
	 *
	 * @return Diagnostics[]
	 */
	public function successful() {
		return array_filter(
			$this->all(),
			function( $diagnostics ) {
				return ! $diagnostics->get_diagnosable()
					->error();
			}
		);
	}

	/**
	 * Return diagnostics for all diagnosables end up with a failure.
	 *
	 * @return Diagnostics[]
	 */
	public function failed() {
		return array_filter(
			$this->all(),
			function( $diagnostics ) {
				return $diagnostics->get_diagnosable()
                    ->error();
			}
		);
	}

	/**
	 * Get the error message if diagnosable failed.
	 *
	 * @return string|null
	 */
	public function message() {
		$error = $this->diagnosable->error();

		return $error instanceof \Exception ?
			$error->getMessage():
			null;
	}

	/**
	 * Transform the diagnostics into an array format.
	 *
	 * @return array
	 */
	public function to_array() {
		return [
			'id' => spl_object_hash( $this->diagnosable ),
			'name' => $this->diagnosable->get_name(),
			'result' => ! $this->diagnosable->error(),
			'error' => $this->message(),
			'diagnosables' => array_reduce(
				$this->all(),
				function( $previous, $diagnostics ) {
					$previous[] = $diagnostics->to_array();
					return $previous;
				},
				[]
			),
		];
	}

	/**
	 * Build the diagnostics for this diagnosable child diagnosables.
	 *
	 * @return void
	 */
	protected function build() {
		foreach( $this->diagnosable->get_diagnosables() as $diagnosable ) {
			$this->diagnostics[] = new Diagnostics( $diagnosable );
		}
	}
}

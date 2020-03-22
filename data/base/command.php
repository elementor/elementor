<?php

namespace Elementor\Data\Base;

abstract class Command {
	private $component;

	protected $types = []; // interface?

	public function __construct( $component ) {
		$this->component = $component;
	}

	abstract protected function get_name();

	protected function before_apply( $data ) {
		return $data;
	}

	protected function apply( $data ) {
		return [];
	}

	protected function after_apply( $data, $result ) {
		return $result;
	}

	protected function run_trait_get( $data ) {}

	protected function run_traits( $type, $data, $result ) {
		if ( ! in_array( $type, $this->types ) ) {
			throw new \Exception( "Error unknown type: '$type'" );
		}

		switch ( $type ) {
			case 'get': {
				$data = $this->run_trait_get( $data );
			}
			break;
		}

		return $data;
	}

	public function run( $type, $data ) {
		$data = $this->before_apply( $data );

		$result = $this->apply( $data );

		$result = $this->after_apply( $data, $result );

		return $this->run_traits( $type, $data, $result );
	}
}

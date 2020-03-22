<?php

namespace Elementor\Data\Base\Traits;

trait Get {
	public function __construct() {
		$this->types [] = 'get';
	}

	protected function before_apply_get( $data ) {
		return $data;
	}

	abstract protected function apply_get( $data );

	protected function after_apply_get( $data, $result ) {
		return $result;
	}

	final public function run_trait_get( $data ) {
		$data = $this->before_apply_get( $data );

		$result = $this->apply_get( $data );

		$result = $this->after_apply_get( $data, $result );

		return $result;
	}
}

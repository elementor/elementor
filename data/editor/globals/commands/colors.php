<?php
namespace Elementor\Data\Editor\Globals\Commands;

class Colors {
	private $component;

	public function __construct( $component ) {
		$this->component = $component;
	}

	public function get_name() {
		return 'colors';
	}

	private function before_apply( $data ) {
		return $data;
	}

	private function apply( $data ) {
		return [
			'sentData' => $data,
			'test',
		];
	}

	private function after_apply( $data, $result ) {
		return $result;
	}

	public function run( $data ) {
		$data = $this->before_apply( $data );
		$result = $this->apply( $data );
		return $this->after_apply( $data, $result );
	}
}

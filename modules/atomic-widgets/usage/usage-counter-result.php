<?php

namespace Elementor\Modules\AtomicWidgets\Usage;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Usage_Counter_Result {
	private int $total = 0;

	private array $changed = [];

	public function set_total( int $total ) {
		$this->total = $total;
	}

	public function set_changed( array $changed ) {
		$this->changed = $changed;
	}

	public function get_total(): int {
		return $this->total;
	}

	public function get_changed_count(): int {
		return count( $this->changed );
	}

	public function is_valid(): bool {
		return $this->total > 0;
	}

	public function each( callable $callback ): void {
		foreach ( $this->changed as $control_data ) {
			$callback(
				$control_data['tab'],
				$control_data['section'],
				$control_data['control']
			);
		}
	}
}

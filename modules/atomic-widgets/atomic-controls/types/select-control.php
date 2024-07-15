<?php

namespace Elementor\Modules\AtomicWidgets\AtomicControls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Select_Control extends Atomic_Control_Base {
	private array $options = [];

	public function get_type(): string {
		return 'select';
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function get_options(): array {
		return $this->options;
	}

	public function get_props(): array {
		return [
			'options' => $this->get_options(),
		];
	}
}

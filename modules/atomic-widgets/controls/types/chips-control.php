<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Chips_Control extends Atomic_Control_Base {
	private array $options = [];

	public function get_type(): string {
		return 'chips';
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function get_props(): array {
		return [
			'options' => $this->options,
		];
	}
}

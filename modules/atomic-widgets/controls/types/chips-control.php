<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Chips_Control extends Atomic_Control_Base {
	private array $options = [];
	private bool $free_chips = false;

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
			'freeChips' => $this->free_chips,
		];
	}

	public function allow_free_chips(): self {
		$this->free_chips = true;

		return $this;
	}

	public function block_free_chips(): self {
		$this->free_chips = false;

		return $this;
	}
}

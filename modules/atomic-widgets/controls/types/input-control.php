<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Input_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;
	private ?string $type = 'text';

	public function get_type(): string {
		return 'input';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;
		return $this;
	}

	public function set_input_type( string $type = 'text' ): self {
		$this->type = $type;
		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'input_type' => $this->type,
		];
	}
}

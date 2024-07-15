<?php
namespace Elementor\Modules\AtomicWidgets\AtomicControls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Textarea_Control extends Atomic_Control_Base {
	private string $placeholder = '';

	public function get_type(): string {
		return 'textarea';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function get_placeholder(): string {
		return $this->placeholder;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->get_placeholder(),
		];
	}
}

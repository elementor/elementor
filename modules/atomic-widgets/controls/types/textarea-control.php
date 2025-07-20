<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Textarea_Control extends Atomic_Control_Base {
	private $placeholder = null;
	private $rows = null;
	private $min_rows = null;

	public function get_type(): string {
		return 'textarea';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_rows( int $rows ): self {
		$this->rows = $rows;

		return $this;
	}

	public function set_min_rows( int $min_rows ): self {
		$this->min_rows = $min_rows;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'rows' => $this->rows,
			'minRows' => $this->min_rows,
		];
	}
}

<?php
namespace Elementor\Modules\AtomicWidgets\AtomicControls\Types;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Select_Control {
	const KEY = 'select';

	private array $options = [];

	public static function make(): self {
		return new static();
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

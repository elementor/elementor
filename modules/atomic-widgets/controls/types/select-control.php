<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Select_Control extends Atomic_Control_Base {
	private array $options = [];
	private ?array $fallback_labels = null;

	public function get_type(): string {
		return 'select';
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function get_props(): array {
		return [
			'options' => $this->options,
			'fallbackLabels' => $this->fallback_labels,
		];
	}

	public function set_fallback_labels( array $fallback_labels ): self {
		$this->fallback_labels = $fallback_labels;

		return $this;
	}
}

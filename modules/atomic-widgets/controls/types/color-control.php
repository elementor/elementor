<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Base_Data_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Color_Control extends Atomic_Control_Base {
	private ?string $default = null;
	private bool $alpha = false;

	public function get_type(): string {
		return 'color';
	}

	public function set_default(string $color): self {
		$this->default = $color;
		return $this;
	}

	public function set_alpha(bool $enable): self {
		$this->alpha = $enable;
		return $this;
	}

	public function get_props(): array {
		return [
			'type' => 'color',
			'alpha' => $this->alpha,
			'default' => $this->default,
			'show_label' => true,
			'label_block' => true,
			'global' => [
				'active' => true,
			],
		];
	}
}

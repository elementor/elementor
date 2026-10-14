<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Inline_Editing_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;

	private ?array $promotion = null;

	public function get_type(): string {
		return 'inline-editing';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_promotion( array $promotion ): self {
		$this->promotion = $promotion;

		return $this;
	}

	public function get_props(): array {
		$props = [
			'placeholder' => $this->placeholder,
		];

		if ( null !== $this->promotion ) {
			$props['promotion'] = $this->promotion;
		}

		return $props;
	}
}

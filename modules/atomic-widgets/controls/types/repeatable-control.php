<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repeatable_Control extends Atomic_Control_Base {

	private string $childControlType;
	private object $childControlProps;
	private bool $showDuplicate = true;
	private bool $showToggle = true;

	public function get_type(): string {
		return 'repeatable';
	}

	public function set_child_control_Type( $controlType ): self {
		$this->childControlType = $controlType;

		return $this;
	}

	public function set_child_control_props( $controlProps ): self {
		$this->childControlProps = $controlProps;

		return $this;
	}

	public function hide_duplicate(): self {
		$this->showDuplicate = false;

		return $this;
	}

	public function hide_toggle(): self {
		$this->showToggle = false;

		return $this;
	}

	public function get_props(): array {
		return [
			'childControlType' => $this->childControlType,
			'childControlProps' => $this->childControlProps,
			'showDuplicate' => $this->showDuplicate,
			'showToggle' => $this->showToggle,
		];
	}
}

<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Repeatable_Control extends Atomic_Control_Base {

	private string $child_control_type;
	private object $child_control_props;
	private bool $show_duplicate;
	private bool $show_toggle;
	private string $repeater_label;
	private? object $initial_values;
	private? string $pattern_label;
	private ?string $placeholder;


	public function get_type(): string {
		return 'repeatable';
	}

	public function set_child_control_type( $controlType ): self {
		$this->child_control_type = $controlType;

		return $this;
	}

	public function set_child_control_props( $controlProps ): self {
		$this->child_control_props = $controlProps;

		return $this;
	}

	public function hide_duplicate(): self {
		$this->show_duplicate = false;

		return $this;
	}

	public function hide_toggle(): self {
		$this->show_toggle = false;

		return $this;
	}
	public function set_initialValues( $initialValues ): self {
		$this->initial_values = $initialValues;

		return $this;
	}
	public function set_patternLabel( $patternLabel ): self {
		$this->pattern_label = $patternLabel;

		return $this;
	}
	public function set_repeaterLabel( string $label ): self
	{
		$this->repeater_label = $label;
		return $this;
	}
	public function set_placeholder( string $placeholder ): self
	{
		$this->placeholder = $placeholder;
		return $this;
	}

	public function get_props(): array {
		return [
			'childControlType' => $this->child_control_type,
			'childControlProps' => $this->child_control_props,
			'showDuplicate' => $this->show_duplicate,
			'showToggle' => $this->show_toggle,
			'initialValues'=> $this->initial_values,
			'patternLabel'=> $this->pattern_label,
			'repeaterLabel' => $this->repeater_label,
			'placeholder' => $this->placeholder,
		];
	}
}

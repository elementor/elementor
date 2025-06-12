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
	private? object $initialValues;
	private? string $patternLabel;
	private string $repeaterLabel;

	public function get_type(): string {
		return 'repeatable';
	}

	public function set_child_control_type( $controlType ): self {
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
	public function set_initialValues( $initialValues ): self {
		$this->initialValues = $initialValues;

		return $this;
	}
	public function set_patternLabel( $patternLabel ): self {
		$this->patternLabel = $patternLabel;

		return $this;
	}
	public function set_repeaterLabel( string $label ): self
	{
		$this->repeaterLabel = $label;
		return $this;
	}

	public function get_props(): array {
		return [
			'childControlType' => $this->childControlType,
			'childControlProps' => $this->childControlProps,
			'showDuplicate' => $this->showDuplicate,
			'showToggle' => $this->showToggle,
			'initialValues'=> $this->initialValues,
		    'patternLabel'=>$this->patternLabel,
			'repeaterLabel' => $this->repeaterLabel,
		];
	}
}

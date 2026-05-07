<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Filter_Repeater_Control extends Atomic_Control_Base {
	private array $allowed_types = [];
	private array $type_options = [];
	private ?string $repeater_label = null;
	private ?string $placeholder = null;
	private ?string $add_label = null;

	public function get_type(): string {
		return 'query-filter-repeater';
	}

	public function set_allowed_types( array $types ): self {
		$this->allowed_types = $types;

		return $this;
	}

	public function set_type_options( array $options ): self {
		$this->type_options = $options;

		return $this;
	}

	public function set_repeater_label( string $label ): self {
		$this->repeater_label = $label;

		return $this;
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function set_add_label( string $label ): self {
		$this->add_label = $label;

		return $this;
	}

	public function get_props(): array {
		return [
			'allowedTypes'  => $this->allowed_types,
			'typeOptions'   => (object) $this->type_options,
			'repeaterLabel' => $this->repeater_label,
			'placeholder'   => $this->placeholder,
			'addLabel'      => $this->add_label,
		];
	}
}

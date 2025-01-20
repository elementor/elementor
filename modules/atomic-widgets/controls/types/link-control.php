<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Link_Control extends Atomic_Control_Base {
	private ?string $placeholder = null;
	private ?array $options = null;
	private ?bool $allow_custom_values = null;

	public function get_type(): string {
		return 'link';
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	/**
	 * @param $options array< string, array{
	 *         label: string,
	 *         groupLabel: string,
	 *     }> | array< string, array{
	 *         label: string,
	 *     }>  Options for the control.
	 *
	 * @return $this
	 */
	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function get_props(): array {
		return [
			'placeholder' => $this->placeholder,
			'options' => $this->options,
			'allowCustomValues' => $this->allow_custom_values,
		];
	}

	public function set_allow_custom_values( bool $allow_custom_values ): self {
		$this->allow_custom_values = $allow_custom_values;

		return $this;
	}
}

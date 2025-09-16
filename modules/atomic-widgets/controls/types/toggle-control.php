<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Toggle_Control extends Atomic_Control_Base {
	private array $options = [];
	private bool $full_width = false;
	private string $size = 'tiny';
	private bool $exclusive = true;
	private ?int $max_items = null;

	public function get_type(): string {
		return 'toggle';
	}

	/**
	 * Set the toggle button options
	 * 
	 * @param array $options Array of options with 'value', 'label', and optional 'show_tooltip'
	 * @return self
	 */
	public function set_options( array $options ): self {
		$this->options = $options;
		return $this;
	}

	/**
	 * Set options from control configuration (dynamic format)
	 * 
	 * @param array $control_options Format: ['key' => ['title' => 'Label', 'icon' => 'eicon-name']]
	 * @return self
	 */
	public function add_options( array $control_options ): self {
		$this->options = [];
		
		foreach ( $control_options as $value => $config ) {
			$this->options[] = [
				'value' => $value,
				'label' => $config['title'] ?? $value,
				'icon' => $config['icon'] ?? null,
				'showTooltip' => true,
				'exclusive' => false,
			];
		}
		
		return $this;
	}

	/**
	 * Set whether the toggle control should take full width
	 *
	 * @param bool $full_width
	 * @return self
	 */
	public function set_full_width( bool $full_width ): self {
		$this->full_width = $full_width;

		return $this;
	}

	/**
	 * Set the size of toggle buttons
	 *
	 * @param string $size One of: 'tiny', 'small', 'medium', 'large'
	 * @return self
	 */
	public function set_size( string $size ): self {
		$allowed_sizes = [ 'tiny', 'small', 'medium', 'large' ];

		if ( in_array( $size, $allowed_sizes, true ) ) {
			$this->size = $size;
		}

		return $this;
	}

	/**
	 * Set whether the toggle control allows only one selection (exclusive) or multiple
	 *
	 * @param bool $exclusive
	 * @return self
	 */
	public function set_exclusive( bool $exclusive ): self {
		$this->exclusive = $exclusive;

		return $this;
	}

	/**
	 * Set maximum number of items to show before switching to dropdown
	 *
	 * @param int|null $max_items
	 * @return self
	 */
	public function set_max_items( ?int $max_items ): self {
		$this->max_items = $max_items;

		return $this;
	}

	public function get_props(): array {
		return [
			'options' => $this->options,
			'fullWidth' => $this->full_width,
			'size' => $this->size,
			'exclusive' => $this->exclusive,
			'convertOptions' => true,
		];
	}
}

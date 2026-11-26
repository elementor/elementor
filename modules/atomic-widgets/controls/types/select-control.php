<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Select_Control extends Atomic_Control_Base {
	private array $options = [];
	private array $groups = [];
	private ?array $fallback_labels = null;
	private array $fallback_values = [];
	private ?string $collection_id = null;
	private ?string $placeholder = null;

	public function get_type(): string {
		return 'select';
	}

	public function set_options( array $options ): self {
		$this->options = $options;

		return $this;
	}

	public function set_groups( array $groups ): self {
		$this->groups = $groups;

		return $this;
	}

	public function set_collection_id( string $collection_id ): self {
		$this->collection_id = $collection_id;

		return $this;
	}

	public function set_placeholder( string $placeholder ): self {
		$this->placeholder = $placeholder;

		return $this;
	}

	public function get_props(): array {
		$props = [
			'options' => $this->options,
			'fallbackLabels' => $this->fallback_labels,
			'placeholder' => $this->placeholder,
		];

		if ( $this->fallback_values ) {
			$props['fallbackValues'] = $this->fallback_values;
		}

		if ( $this->groups ) {
			$props['groups'] = $this->groups;
		}

		if ( $this->collection_id ) {
			$props['collectionId'] = $this->collection_id;
		}
		return $props;
	}

	public function set_fallback_labels( array $fallback_labels ): self {
		$this->fallback_labels = $fallback_labels;

		return $this;
	}

	/**
	 * Maps a stored value that is no longer an option to the option the control selects in its place. The stored value is not rewritten.
	 */
	public function set_fallback_values( array $fallback_values ): self {
		$this->fallback_values = $fallback_values;

		return $this;
	}
}

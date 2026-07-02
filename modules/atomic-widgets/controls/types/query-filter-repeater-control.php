<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Filter_Repeater_Control extends Atomic_Control_Base {
	private array $allowed_keys = [];
	private array $key_config = [];
	private ?string $label = null;
	private ?string $chips_placeholder = null;

	public function get_type(): string {
		return 'query-filter-repeater';
	}

	public function set_allowed_keys( array $keys ): self {
		$this->allowed_keys = $keys;

		return $this;
	}

	public function set_key_config( array $config ): self {
		$this->key_config = $config;

		return $this;
	}

	public function set_label( string $label ): self {
		$this->label = $label;

		return $this;
	}

	public function set_chips_placeholder( string $placeholder ): self {
		$this->chips_placeholder = $placeholder;

		return $this;
	}

	public function get_props(): array {
		return [
			'allowedKeys'      => $this->allowed_keys,
			'keyConfig'        => (object) $this->key_config,
			'label'            => $this->label,
			'chipsPlaceholder' => $this->chips_placeholder,
		];
	}
}

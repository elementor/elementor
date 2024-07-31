<?php

namespace Elementor\Modules\AtomicWidgets\Schema;

use JsonSerializable;

class Atomic_Prop implements JsonSerializable {
	private $default_value = null;

	public static function make(): self {
		return new self();
	}

	public function default( $default_value ): self {
		$this->default_value = $default_value;

		return $this;
	}

	public function get_default() {
		return $this->default_value;
	}

	public function jsonSerialize(): array {
		return [
			'default' => $this->default_value,
		];
	}
}

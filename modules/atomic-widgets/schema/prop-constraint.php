<?php

namespace Elementor\Modules\AtomicWidgets\Schema;

abstract class Prop_Constraint implements \JsonSerializable {
	abstract public function get_type(): string;

	abstract public function get_value();

	abstract public function validate( $value ): void;

	public function jsonSerialize(): array {
		return [
			'type' => $this->get_type(),
			'value' => $this->get_value(),
		];
	}
}

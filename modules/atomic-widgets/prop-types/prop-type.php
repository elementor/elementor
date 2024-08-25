<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {

	abstract public function get_type(): string;

	abstract public function validate( $value ): void;

	/**
	 * @return array<string>
	 */
	public function get_dynamic_categories(): array {
		return [];
	}

	public function jsonSerialize(): array {
		return [
			'type' => $this->get_type(),
			'dynamic_categories' => $this->get_dynamic_categories(),
		];
	}
}

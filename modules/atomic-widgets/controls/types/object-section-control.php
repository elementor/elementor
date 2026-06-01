<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types;

use Elementor\Modules\AtomicWidgets\Controls\Base\Atomic_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Object_Section_Control extends Atomic_Control_Base {
	private array $items = [];

	public function get_type(): string {
		return 'object-section';
	}

	public function set_items( array $items ): self {
		$this->items = $items;

		return $this;
	}

	public function get_props(): array {
		return [
			'items' => array_map(
				static fn( Atomic_Control_Base $control ) => $control->jsonSerialize()['value'],
				$this->items
			),
		];
	}
}

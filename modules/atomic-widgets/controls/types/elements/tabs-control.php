<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types\Elements;

use Elementor\Modules\AtomicWidgets\Base\Element_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Tabs_Control extends Element_Control_Base {
	private array $child_elements = [];

	public function get_type(): string {
		return 'tabs';
	}

	public function set_child_element( string $element_type, string $target_container_selector ): self {
		$this->child_elements[] = [
			'type' => $element_type,
			'target_container_selector' => $target_container_selector,
		];

		return $this;
	}

	public function get_props(): array {
		return [
			'childElements' => $this->child_elements,
		];
	}
} 
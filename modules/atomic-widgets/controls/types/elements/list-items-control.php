<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types\Elements;

use Elementor\Modules\AtomicWidgets\Controls\Base\Element_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class List_Items_Control extends Element_Control_Base {
	public function get_type(): string {
		return 'list-items';
	}

	public function get_props(): array {
		return [];
	}
}

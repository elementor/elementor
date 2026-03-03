<?php
namespace Elementor\Modules\AtomicWidgets\Controls\Types\Elements;

use Elementor\Modules\AtomicWidgets\Controls\Base\Element_Control_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mega_Menu_Control extends Element_Control_Base {
	public function get_type(): string {
		return 'mega-menu';
	}

	public function get_props(): array {
		return [];
	}
}

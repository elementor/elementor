<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon_Open;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon\Atomic_Accordion_Item_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Icon_Open extends Atomic_Accordion_Item_Icon {
	public static $widget_description = 'The open-state indicator slot of an accordion item header. Shown only while the item is open, and only when the accordion uses a different icon for that state. Holds an e-svg (the same chevron as the closed icon) by default, so Open angle turns it the same way; the contents can be replaced with an SVG, text, or both.';

	public static function get_type() {
		return Atomic_Accordion::ELEMENT_TYPE_ICON_OPEN;
	}

	public static function get_element_type(): string {
		return Atomic_Accordion::ELEMENT_TYPE_ICON_OPEN;
	}

	public function get_title() {
		return esc_html__( 'Open icon', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'accordion', 'icon', 'chevron', 'open' ];
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon_Open;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Accordion\Atomic_Accordion_Item_Icon\Atomic_Accordion_Item_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Accordion_Item_Icon_Open extends Atomic_Accordion_Item_Icon {
	const DEFAULT_ICON = 'images/chevron-up.svg';
	const DEFAULT_ICON_PATH = ELEMENTOR_ASSETS_PATH . self::DEFAULT_ICON;
	const DEFAULT_ICON_URL = ELEMENTOR_ASSETS_URL . self::DEFAULT_ICON;

	public static $widget_description = 'The open-state indicator slot of an accordion item header. Shown only while the item is open, and only when the accordion uses a different icon for that state. Holds an e-svg (defaulting to an upward chevron) by default; the contents can be replaced with an SVG, text, or both.';

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

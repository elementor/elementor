<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Flexbox;

use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Flexbox extends Div_Block {
	public static function get_type() {
		return 'flexbox';
	}

	public static function get_element_type(): string {
		return 'flexbox';
	}

	public function get_title() {
		return esc_html__( 'Flexbox', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-flexbox';
	}
}

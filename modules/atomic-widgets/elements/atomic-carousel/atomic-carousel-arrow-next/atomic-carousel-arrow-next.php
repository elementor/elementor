<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Arrow_Next;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Arrow_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Carousel_Arrow_Next extends Atomic_Carousel_Arrow_Base {
	use Has_Element_Template;

	public static $widget_description = 'The next-slide button of a carousel. A container: drop any element inside (SVG, image, text) to become the arrow, and the button keeps handling navigation. Must be a direct child of e-carousel, never of the viewport.';

	public static function get_type() {
		return 'e-carousel-arrow-next';
	}

	public static function get_element_type(): string {
		return 'e-carousel-arrow-next';
	}

	public function get_title() {
		return esc_html__( 'Next arrow', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-chevron-right';
	}

	protected static function get_default_label(): string {
		return esc_html__( 'Next', 'elementor' );
	}

	protected static function get_aria_label(): string {
		return esc_attr__( 'Next slide', 'elementor' );
	}

	protected static function get_inline_edge(): string {
		return 'inset-inline-end';
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-carousel-arrow-next' => __DIR__ . '/atomic-carousel-arrow-next.html.twig',
		];
	}
}

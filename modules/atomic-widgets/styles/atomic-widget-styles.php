<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Plugin;

class Atomic_Widget_Styles {
	public function register_hooks() {
		add_action( 'elementor/element/parse_css', fn( Post $post, Element_Base $element ) => $this->parse_element_style( $post, $element ), 10, 2 );
	}

	private function parse_element_style( Post $post, Element_Base $element ) {
		if ( ! ( $element instanceof Atomic_Widget_Base || $element instanceof Atomic_Element_Base )
			|| Post::class !== get_class( $post ) ) {
			return;
		}

		$styles = $element->get_raw_data()['styles'];

		if ( empty( $styles ) ) {
			return;
		}

		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) use ( &$post ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			$post->add_font( $value );
		} )->render( $styles );

		$post->get_stylesheet()->add_raw_css( $css );
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Plugin;

class Atomic_Widget_Styles {
	private array $rendered_base_styles = [];

	public function register_hooks() {
		add_action( 'elementor/element/parse_css', fn( Post $post, Element_Base $element ) => $this->parse_element_style( $post, $element ), 10, 2 );
	}

	private function parse_element_style( Post $post, Element_Base $element ) {
		if ( ! ( $element instanceof Atomic_Widget_Base || $element instanceof Atomic_Element_Base )
			|| Post::class !== get_class( $post ) ) {
			return;
		}

		$styles = $element->get_raw_data()['styles'];

		$base_styles = $this->get_element_base_styles( $element, $post->get_post_id() );

		$styles = array_merge( $base_styles, $styles );

		if ( empty( $styles ) ) {
			return;
		}

		$this->styles_enqueue_fonts( $styles );

		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->render( $styles );

		$post->get_stylesheet()->add_raw_css( $css );
	}

	/**
	 * Enqueue styles fonts.
	 *
	 * Styles format:
	 *   <int, array{
	 *     id: string,
	 *     type: string,
	 *     variants: array<int, array{
	 *       props: array<string, mixed>,
	 *       meta: array<string, mixed>
	 *     }>
	 *   }>
	 *
	 * @param array $styles
	 */
	private function styles_enqueue_fonts( array $styles ): void {
		foreach ( $styles as $style ) {
			foreach ( $style['variants'] as $variant ) {
				if ( isset( $variant['props']['font-family'] ) ) {
					Plugin::$instance->frontend->enqueue_font( $variant['props']['font-family']['value'] );
				}
			}
		}
	}

	private function get_element_base_styles( $element, $post_id ): array {
		$element_type = $element::get_element_type();
		$key = "{$post_id}-{$element_type}";

		$is_base_styles_rendered = isset( $this->rendered_base_styles[ $key ] );
		if ( ! $is_base_styles_rendered ) {
			$this->rendered_base_styles[ $key ] = true;
		}

		return $is_base_styles_rendered ? [] : $element::get_base_styles();
	}
}

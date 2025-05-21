<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Plugin;

class Atomic_Widget_Styles {

	private array $css = [];

	public function register_hooks() {
		add_action( 'elementor/element/parse_css', fn( Post_CSS $post, Element_Base $element ) => $this->parse_element_style( $post, $element ), 10, 2 );

		add_action( 'elementor/atomic-widget/styles/enqueue', fn( string $breakpoint, Styles_Manager $styles_manager ) => $this->enqueue_styles( $breakpoint, $styles_manager ), 10, 2 );
	}

	private function enqueue_styles( string $breakpoint, Styles_Manager $styles_manager ) {
		if ( ! isset( $this->css[ $breakpoint ] ) ) {
			return;
		}

		foreach ( $this->css[ $breakpoint ] as $post_id => $css ) {
			$styles_manager->register(
				$breakpoint,
				'elementor-atomic-widget-styles-' . $post_id . '-' . $breakpoint,
				'atomic-widget-styles-' . $post_id . '-' . $breakpoint,
				$css
			);
		}
	}

	private function parse_element_style( Post_CSS $post, Element_Base $element ) {
		if ( ! Utils::is_atomic( $element ) ) {
			return;
		}

		$styles = $element->get_raw_data()['styles'];

		if ( empty( $styles ) ) {
			return;
		}

		$grouped = $this->group_by_breakpoint( $styles );

		foreach ( $grouped as $breakpoint => $styles ) {
			$css = Styles_Renderer::make(
				Plugin::$instance->breakpoints->get_breakpoints_config()
			)->on_prop_transform( function( $key, $value ) use ( &$post ) {
				if ( 'font-family' !== $key ) {
					return;
				}

				// TODO: Is it ok to add the font here?
				$post->add_font( $value );
			} )->render( $styles );

			$this->css[ $breakpoint ][ $post->get_post_id() ] ??= '';

			$this->css[ $breakpoint ][ $post->get_post_id() ] .= $css;
		}
	}

	private function group_by_breakpoint( $styles ) {
		$groups = [];

		foreach ( $styles as $style ) {
			foreach ( $style['variants'] as $variant ) {
				$breakpoint = $variant['meta']['breakpoint'] ?? 'desktop';

				$groups[ $breakpoint ][] = [
					'id' => $style['id'],
					'type' => $style['type'],
					'variants' => [ $variant ],
				];
			}
		}

		return $groups;
	}
}

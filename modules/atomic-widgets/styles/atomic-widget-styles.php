<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

class Atomic_Widget_Styles {

	private array $css = [];

	public function register_hooks() {
		add_action( 'elementor/atomic-widget/styles/enqueue', fn( string $breakpoint, string $post_id, Styles_Manager $styles_manager ) => $this->enqueue_styles( $breakpoint, $post_id, $styles_manager ), 30, 3 );
	}

	private function enqueue_styles( string $breakpoint, string $post_id,  Styles_Manager $styles_manager ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return;
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( $post_id ) {
			$this->parse_element_style( $element_data, $post_id );
		});

		if ( ! isset( $this->css[ $breakpoint ][ $post_id ] ) ) {
			return;
		}

		$styles_manager->register(
			$breakpoint,
			'elementor-atomic-widget-styles-' . $post_id . '-' . $breakpoint,
			'atomic-widget-styles-' . $post_id . '-' . $breakpoint,
			$this->css[ $breakpoint ][ $post_id ]['css'] ?? '',
			$this->css[ $breakpoint ][ $post_id ]['fonts'] ?? []
		);
	}

	private function parse_element_style(  array $element_data, string $post_id ) {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return;
		}

		$styles = $element_data['styles'] ?? [];

		if ( empty( $styles ) ) {
			return;
		}

		$fonts = [];

		$grouped = $this->group_by_breakpoint( $styles );

		foreach ( $grouped as $breakpoint => $styles ) {
			$css = Styles_Renderer::make(
				Plugin::$instance->breakpoints->get_breakpoints_config()
			)->on_prop_transform( function( $key, $value ) use ( &$fonts ) {
				if ( 'font-family' !== $key ) {
					return;
				}

				$fonts[] = $value;
			} )->render( $styles );

			$this->css[ $breakpoint ][ $post_id ]['css'] ??= '';

			$this->css[ $breakpoint ][ $post_id ]['css'] .= $css;

			$this->css[ $breakpoint ][ $post_id ]['fonts'] = array_unique( $fonts );
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

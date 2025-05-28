<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Plugin;

class Atomic_Widget_Base_Styles {
	private ?array $css_by_breakpoint = null;

	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/enqueue',
			fn( string $breakpoint, string $post_id, Styles_Manager $styles_manager ) => $this->enqueue_styles( $breakpoint, $post_id, $styles_manager ),
			30,
			3
		);
	}

	private function enqueue_styles( string $breakpoint, string $post_id, Styles_Manager $styles_manager ) {
		$elements_data = Plugin::instance()->documents->get( $post_id )->get_elements_data();
		$used_atomic_elements = $this->get_used_atomic_elements( $elements_data );

		if ( empty( $used_atomic_elements ) ) {
			return;
		}

		if ( ! $this->css_by_breakpoint ) {
			$this->css_by_breakpoint = $this->render_and_group_base_styles( $used_atomic_elements );
		}

		$css = $this->css_by_breakpoint[ $breakpoint ] ?? null;

		if ( ! $css ) {
			return;
		}

		$styles_manager->register(
			$breakpoint,
			'elementor-atomic-base-' . $post_id . '-' . $breakpoint,
			'atomic-base-' . $post_id . '-' . $breakpoint,
			$css['css'] ?? '',
			$css['fonts'] ?? []
		);
	}

	private function get_used_atomic_elements( array $elements_data ): array {
		$used_elements = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( &$used_elements ) {
			if ( empty( $element_data['widgetType'] ) && empty( $element_data['elType'] ) ) {
				return;
			}

			$element_type = $element_data['widgetType'] ?? $element_data['elType'];
			$element = Plugin::$instance->elements_manager->get_element_types( $element_type ) ??
					  Plugin::$instance->widgets_manager->get_widget_types( $element_type );

			if ( $element && Utils::is_atomic( $element ) ) {
				$used_elements[ $element_type ] = $element;
			}
		});

		return $used_elements;
	}

	private function render_and_group_base_styles( array $atomic_elements ): array {
		$base_styles = Collection::make( $atomic_elements )
			->map( fn( $element ) => $element->get_base_styles() )
			->flatten()
			->all();

		if ( empty( $base_styles ) ) {
			return [];
		}

		return $this->group_base_styles_by_breakpoint( $base_styles );
	}

	private function group_base_styles_by_breakpoint( array $styles ): array {
		$groups = [];
		$fonts = [];

		foreach ( $styles as $style ) {
			$breakpoint = $style['meta']['breakpoint'] ?? 'desktop';
			$groups[ $breakpoint ][] = $style;
		}

		$result = [];
		foreach ( $groups as $breakpoint => $breakpoint_styles ) {
			$css = Styles_Renderer::make(
				Plugin::$instance->breakpoints->get_breakpoints_config()
			)->on_prop_transform( function( $key, $value ) use ( &$fonts ) {
				if ( 'font-family' !== $key ) {
					return;
				}

				$fonts[] = $value;
			} )->render( $breakpoint_styles );

			$result[ $breakpoint ] = [
				'css' => $css,
				'fonts' => array_unique( $fonts ),
			];
		}

		return $result;
	}

	/**
	 * Get all base styles from atomic elements
	 *
	 * @return array Array of base styles from all atomic elements
	 */
	public function get_all_base_styles(): array {
		$elements = Plugin::$instance->elements_manager->get_element_types();
		$widgets = Plugin::$instance->widgets_manager->get_widget_types();

		return Collection::make( $elements )
			->merge( $widgets )
			->filter( fn( $element ) => Utils::is_atomic( $element ) )
			->map( fn( $element ) => $element->get_base_styles() )
			->flatten()
			->all();
	}
}

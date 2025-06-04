<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Plugin;

class Atomic_Widget_Base_Styles {
	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/enqueue',
			fn( Styles_Manager $styles_manager ) => $this->enqueue_styles( $styles_manager ),
			10,
			3
		);
	}

	private function enqueue_styles( Styles_Manager $styles_manager ) {
		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts-to-enqueue', [] );

		if ( empty( $post_ids ) ) {
			return;
		}

		$styles = [];

		foreach ( $post_ids as $post_id ) {
			$elements_data = Plugin::instance()->documents->get( $post_id )->get_elements_data();
			$used_atomic_elements = $this->get_used_atomic_elements( $elements_data );

			$styles = Collection::make( $used_atomic_elements )
				->map( fn( $element ) => $element->get_base_styles() )
				->flatten()
				->merge( $styles )
				->all();
		}

		$styles_manager->register(
			'base',
			$styles,
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

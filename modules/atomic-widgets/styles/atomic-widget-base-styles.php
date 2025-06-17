<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Plugin;

class Atomic_Widget_Base_Styles {
	CONST CSS_FILE_KEY = 'base';

	public function register_hooks() {
		add_action(
			'elementor/atomic-widget/styles/register',
			fn( Styles_Manager $styles_manager ) => $this->register_styles( $styles_manager ),
			10,
			3
		);
	}

	private function register_styles( Styles_Manager $styles_manager ) {
		$get_styles = function( $post_ids ) {
			if ( empty( $post_ids ) ) {
				return [];
			}

			$styles = [];

			foreach ( $post_ids as $post_id ) {
				$elements_data = Plugin::instance()->documents->get_doc_for_frontend( $post_id )->get_elements_data();
				$used_atomic_elements = $this->get_used_atomic_elements( $elements_data );

				$styles = Collection::make( $used_atomic_elements )
					->map( fn( $element ) => $element->get_base_styles() )
					->flatten()
					->merge( $styles )
					->all();
			}

			return $styles;
		};


		$styles_manager->register(
			self::CSS_FILE_KEY,
			$get_styles,
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
}

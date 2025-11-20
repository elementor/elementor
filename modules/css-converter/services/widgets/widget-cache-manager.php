<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Cache_Manager {

	public function clear_document_cache_for_css_converter_widgets( int $post_id ): void {
		if ( ! $post_id ) {
			return;
		}

		delete_post_meta( $post_id, '_elementor_element_cache' );
		delete_post_meta( $post_id, '_elementor_css' );
		delete_post_meta( $post_id, '_elementor_atomic_cache_validity' );
	}

	public function page_has_css_converter_widgets( int $post_id ): bool {
		$post_data = get_post_meta( $post_id, '_elementor_data', true );
		if ( empty( $post_data ) ) {
			return false;
		}

		if ( is_string( $post_data ) ) {
			$post_data = json_decode( $post_data, true );
		}

		if ( ! is_array( $post_data ) ) {
			return false;
		}

		return $this->traverse_elements_for_css_converter_widgets( $post_data );
	}

	public function post_has_css_converter_widgets_of_type( int $post_id, string $element_type ): bool {
		$cache_key = '_css_converter_widget_types';
		$cached_types = get_post_meta( $post_id, $cache_key, true );

		if ( is_array( $cached_types ) ) {
			return in_array( $element_type, $cached_types, true );
		}

		$post_data = get_post_meta( $post_id, '_elementor_data', true );
		if ( empty( $post_data ) ) {
			update_post_meta( $post_id, $cache_key, [] );
			return false;
		}

		if ( is_string( $post_data ) ) {
			$post_data = json_decode( $post_data, true );
		}

		if ( ! is_array( $post_data ) ) {
			update_post_meta( $post_id, $cache_key, [] );
			return false;
		}

		$widget_types = [];
		$this->traverse_elements( $post_data, function( $element ) use ( &$widget_types ) {
			if ( $this->is_css_converter_widget_element( $element ) ) {
				$widget_type = $this->extract_widget_type_from_element( $element );
				if ( $widget_type ) {
					$widget_types[] = $widget_type;
				}
			}
		} );

		$widget_types = array_unique( $widget_types );
		$this->cache_css_converter_widget_types( $post_id, $widget_types );

		return in_array( $element_type, $widget_types, true );
	}

	public function cache_css_converter_widget_types( int $post_id, array $widget_types ): void {
		update_post_meta( $post_id, '_css_converter_widget_types', $widget_types );
	}

	private function traverse_elements_for_css_converter_widgets( array $elements_data ): bool {
		foreach ( $elements_data as $element_data ) {
			if ( $this->is_css_converter_widget_element( $element_data ) ) {
				return true;
			}

			if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				if ( $this->traverse_elements_for_css_converter_widgets( $element_data['elements'] ) ) {
					return true;
				}
			}
		}
		return false;
	}

	private function traverse_elements( array $elements, callable $callback ): void {
		foreach ( $elements as $element ) {
			$callback( $element );
			if ( isset( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$this->traverse_elements( $element['elements'], $callback );
			}
		}
	}

	private function is_css_converter_widget_element( array $element ): bool {
		return isset( $element['editor_settings']['css_converter_widget'] ) &&
				$element['editor_settings']['css_converter_widget'];
	}

	private function extract_widget_type_from_element( array $element ): ?string {
		return $element['widgetType'] ?? $element['elType'] ?? null;
	}
}

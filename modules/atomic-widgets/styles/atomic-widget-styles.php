<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

class Atomic_Widget_Styles {
	CONST CSS_FILE_KEY = 'local';

	public function register_hooks() {
		add_action( 'elementor/atomic-widget/styles/enqueue', function( Styles_Manager $styles_manager ){
			$this->register_styles( $styles_manager );
		}, 30, 3 );
	}

	private function register_styles( Styles_Manager $styles_manager ) {
		$get_styles = function( $post_ids ) {
			if ( empty( $post_ids ) ) {
				return [];
			}

			$styles = [];

			foreach ( $post_ids as $post_id ) {
				$styles = array_merge( $styles, $this->parse_post_styles( $post_id ) );
			}

			return $styles;
		};

		$styles_manager->register( self::CSS_FILE_KEY, $get_styles );
	}

	private function parse_post_styles( $post_id ) {
		$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );

		if ( ! $document ) {
			return [];
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return [];
		}

		$post_styles = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( &$post_styles ) {
			$post_styles = array_merge( $post_styles,  $this->parse_element_style( $element_data ) );
		});

		return $post_styles;
	}

	private function parse_element_style(  array $element_data ) {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		return $element_data['styles'] ?? [];
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

class Atomic_Widget_Styles {
	const STYLES_KEY = 'local';

	public function register_hooks() {
		add_action( 'elementor/atomic-widgets/styles/register', function( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
			$this->register_styles( $styles_manager, $post_ids );
		}, 30, 2 );
	}

	private function register_styles( Atomic_Styles_Manager $styles_manager, array $post_ids ) {
		foreach ( $post_ids as $post_id ) {
			$get_styles = function() use ( $post_id ) {
				return $this->parse_post_styles( $post_id );
			};

			$styles_manager->register( self::STYLES_KEY . '-' . $post_id, $get_styles );
		}
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
			$post_styles = array_merge( $post_styles, $this->parse_element_style( $element_data ) );
		});

		return $post_styles;
	}

	private function parse_element_style( array $element_data ) {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		return $element_data['styles'] ?? [];
	}
}

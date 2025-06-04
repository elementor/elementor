<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles_Manager;
use Elementor\Modules\AtomicWidgets\Utils;
use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;
use Elementor\Plugin;

class Atomic_Widget_Styles {

	private array $style_defs = [];

	public function register_hooks() {
		add_action( 'elementor/atomic-widget/styles/enqueue', function( Styles_Manager $styles_manager ){
			$this->enqueue_styles( $styles_manager );
		}, 30, 3 );
	}

	private function enqueue_styles( Styles_Manager $styles_manager ) {
		$post_ids = apply_filters( 'elementor/atomic-widgets/styles/posts-to-enqueue', [] );

		if ( empty( $post_ids ) ) {
			return;
		}

		foreach ( $post_ids as $post_id ) {
			$this->parse_post_styles( $post_id );
		}

		$styles_manager->register( 'local', $this->style_defs );
	}

	private  function parse_post_styles( $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return;
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return;
		}

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) {
			$this->parse_element_style( $element_data );
		});
	}

	private function parse_element_style(  array $element_data ) {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( ! Utils::is_atomic( $element_instance ) ) {
			return;
		}

		$this->style_defs = array_merge( $this->style_defs, $element_data['styles'] );
	}
}

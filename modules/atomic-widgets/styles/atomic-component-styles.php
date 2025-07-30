<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Cache_Validity;

/**
 * Atomic Component styles fetching for render
 */
class Atomic_Component_Styles {
	const CACHE_KEY_PREFIX = 'atomic-component-styles-related-posts';

	public function register_hooks() {
		add_action( 'elementor/post/render', function( $post_id ) {
			$cache_validity = new Cache_Validity();

			if ( $cache_validity->is_valid( [ self::CACHE_KEY_PREFIX, $post_id ] ) ) {
				$related_posts = $cache_validity->get_meta( [ self::CACHE_KEY_PREFIX, $post_id ] );

				$this->add_post_ids_to_styles_manager( $related_posts );

				return;
			}

			$components = $this->get_components_from_post( $post_id );
			$component_ids = array_unique(
				array_map(
					fn( $component ) => $component['settings']['component_id']['value'],
					array_filter(
						$components,
						fn ( $component ) => isset( $component['settings']['component_id']['value'] ),
					)
				)
			);

			$cache_validity->validate( [ self::CACHE_KEY_PREFIX, $post_id ], $component_ids );

			$this->add_post_ids_to_styles_manager( $component_ids );
		} );

		add_action( 'elementor/document/after_save', fn( Document $document ) => $this->invalidate_cache(
			[ $document->get_main_post()->ID ]
		), 20, 2 );
	}

	private function add_post_ids_to_styles_manager( array $post_ids ) {
		foreach ( $post_ids as $post_id ) {
			do_action( 'elementor/post/render', $post_id );
		}
	}

	private function get_components_from_post( string $post_id ): array {
		$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );

		if ( ! $document ) {
			return [];
		}

		$elements_data = $document->get_elements_data();

		if ( empty( $elements_data ) ) {
			return [];
		}

		$components = [];

		Plugin::$instance->db->iterate_data( $elements_data, function( $element_data ) use ( &$components ) {
			if ( isset( $element_data['widgetType'] ) && 'e-component' === $element_data['widgetType'] ) {
				$components[] = $element_data;
			}
		} );

		return $components;
	}

	private function invalidate_cache( ?array $post_ids = null ) {
		$cache_validity = new Cache_Validity();

		if ( empty( $post_ids ) ) {
			$cache_validity->invalidate( [ self::CACHE_KEY_PREFIX ] );

			return;
		}

		foreach ( $post_ids as $post_id ) {
			$cache_validity->invalidate( [ self::CACHE_KEY_PREFIX, $post_id ] );
		}
	}
}

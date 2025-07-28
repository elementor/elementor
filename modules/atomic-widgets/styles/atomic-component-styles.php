<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Base\Document;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Cache_Validity;

/**
component content JSON:
[{"id":"e79b0a0","elType":"e-flexbox","settings":{"classes":{"$$type":"classes","value":["e-e79b0a0-eb47f57"]}},"elements":[{"id":"625add2","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-625add2-25a6281"]},"image":{"$$type":"image","value":{"size":{"$$type":"string","value":"medium"},"src":{"$$type":"image-src","value":{"id":{"$$type":"image-attachment-id","value":960},"url":null}}}}},"elements":[],"widgetType":"e-image","styles":{"e-625add2-25a6281":{"id":"e-625add2-25a6281","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"max-width":{"$$type":"size","value":{"size":35,"unit":"%"}}}}]}},"editor_settings":[],"version":"0.0"},{"id":"449d338","elType":"e-div-block","settings":{"classes":{"$$type":"classes","value":["e-449d338-87a1d34"]}},"elements":[{"id":"6b6048a","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-6b6048a-f3d3a6a"]}},"elements":[],"widgetType":"e-heading","styles":{"e-6b6048a-f3d3a6a":{"id":"e-6b6048a-f3d3a6a","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"900"},"font-size":{"$$type":"size","value":{"size":65,"unit":"px"}},"color":{"$$type":"color","value":"#5e6171"}}}]}},"editor_settings":[],"version":"0.0"},{"id":"3f16ed7","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-3f16ed7-ac02a8a"]},"tag":{"$$type":"string","value":"h4"}},"elements":[],"widgetType":"e-heading","styles":{"e-3f16ed7-ac02a8a":{"id":"e-3f16ed7-ac02a8a","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-size":{"$$type":"size","value":{"size":22,"unit":"px"}},"color":{"$$type":"color","value":"#6f7277"}}}]}},"editor_settings":[],"version":"0.0"},{"id":"472e342","elType":"e-flexbox","settings":{"classes":{"$$type":"classes","value":["e-472e342-8aba5de"]}},"elements":[{"id":"5dac8d2","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-5dac8d2-ad7ccc5"]}},"elements":[],"widgetType":"e-button","styles":{"e-5dac8d2-ad7ccc5":{"id":"e-5dac8d2-ad7ccc5","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"700"},"color":{"$$type":"color","value":"#ffffff"},"background":{"$$type":"background","value":{"color":{"$$type":"color","value":"#73c76f"}}}}}]}},"editor_settings":[],"version":"0.0"},{"id":"dc6e061","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-dc6e061-0c2e6af"]}},"elements":[],"widgetType":"e-button","styles":{"e-dc6e061-0c2e6af":{"id":"e-dc6e061-0c2e6af","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"700"},"color":{"$$type":"color","value":"#ffffff"},"background":{"$$type":"background","value":{"color":{"$$type":"color","value":"#79290f"}}}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-472e342-8aba5de":{"id":"e-472e342-8aba5de","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"justify-content":{"$$type":"string","value":"space-between"}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-449d338-87a1d34":{"id":"e-449d338-87a1d34","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"width":{"$$type":"size","value":{"size":60,"unit":"%"}},"height":{"$$type":"size","value":{"size":100,"unit":"%"}},"display":{"$$type":"string","value":"flex"},"flex-direction":{"$$type":"string","value":"column"},"flex":{"$$type":"flex","value":{"flexGrow":null,"flexShrink":null,"flexBasis":null}},"justify-content":{"$$type":"string","value":"space-evenly"},"align-items":{"$$type":"string","value":"start"},"align-self":{"$$type":"string","value":"stretch"}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-e79b0a0-eb47f57":{"id":"e-e79b0a0-eb47f57","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"flex-direction":{"$$type":"string","value":"row"},"align-items":{"$$type":"string","value":"stretch"}}}]}},"editor_settings":[],"version":"0.0"}]

component JSON (to be added to a document data - replace the post_id with the actual post_id):
{"id":"a1d2cb6","elType":"widget","settings":{"post_id":{"$$type":"string","value":"180"}},"name":{"$$type":"string","value":"This is an overridden name"},"title":{"$$type":"string","value":"This is an overridden title"},"elements":[],"widgetType":"e-component","styles":[],"editor_settings":[],"version":"0.0"}
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
					fn( $component ) => $component['settings']['post_id']['value'], $components
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
		do_action( 'elementor/atomic-styles/related-posts', $post_ids );
	}

	private function get_components_from_post( string $post_id ) {
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
			if ( isset( $element_data['widgetType'] ) && $element_data['widgetType'] === 'e-component' ) {
				$components[] = $element_data;

				$components = array_merge(
					$components,
					$this->get_components_from_post( $element_data['settings']['post_id']['value'] )
				);
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

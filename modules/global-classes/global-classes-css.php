<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

class Global_Classes_CSS {
	public function register_hooks() {
		add_action( 'elementor/css-file/post/parse', fn( Post_CSS $post ) => $this->inject_global_classes( $post ), 20 );

		add_action( 'elementor/global_classes/create', fn() => $this->clear_kit_css_cache() );
		add_action( 'elementor/global_classes/update', fn() => $this->clear_kit_css_cache() );
		add_action( 'elementor/global_classes/delete', fn() => $this->clear_kit_css_cache() );
		add_action( 'elementor/global_classes/arrange', fn() => $this->clear_kit_css_cache() );
	}

	private function inject_global_classes( Post_CSS $post ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post->get_post_id() ) ) {
			return;
		}

		$global_classes = Global_Classes_Repository::make()->all();

		if ( $global_classes->get_items()->is_empty() ) {
			return;
		}

		$sorted_items = $global_classes
			->get_order()
			->map(
				fn( $id ) => $global_classes->get_items()->get( $id )
			);

		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) use ( &$post ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			$post->add_font( $value );
		} )->render( $sorted_items->all() );

		$post->get_stylesheet()->add_raw_css( $css );
	}

	private function clear_kit_css_cache() {
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		Post_CSS::create( $kit_id )->delete();
	}
}

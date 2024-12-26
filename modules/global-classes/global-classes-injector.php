<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Files\CSS\Post;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

class Global_Classes_Injector {
	public function register_hooks() {
		add_action( 'elementor/css-file/post/parse', fn( Post $post ) => $this->inject_global_classes( $post ) );
	}

	private function inject_global_classes( Post $post ) {
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

		$css = Styles_Renderer::make( [
			'breakpoints' => Plugin::$instance->breakpoints->get_breakpoints_config(),
		] )->render( $sorted_items->all() );

		$post->get_stylesheet()->add_raw_css( $css );
	}
}

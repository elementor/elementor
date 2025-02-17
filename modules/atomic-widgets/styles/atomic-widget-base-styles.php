<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Plugin;

class Atomic_Widget_Base_Styles {
	public function register_hooks() {
		add_action( 'elementor/css-file/post/parse', fn( Post_CSS $post ) => $this->inject_elements_base_styles( $post ), 10 );
	}

	private function inject_elements_base_styles( Post_CSS $post ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post->get_post_id() ) ) {
			return;
		}

		$elements = Plugin::$instance->elements_manager->get_element_types();
		$widgets = Plugin::$instance->widgets_manager->get_widget_types();

		$base_styles = Collection::make( $elements )
			->merge( $widgets )
			->filter( fn( $element ) => $element instanceof Atomic_Widget_Base || $element instanceof Atomic_Element_Base )
			->map( fn( $element ) => $element->get_base_styles() )
			->flatten()
			->all();

		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) use ( &$post ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			$post->add_font( $value );
		} )->render( $base_styles );

		$post->get_stylesheet()->add_raw_css( $css );
	}
}

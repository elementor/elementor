<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Core\Files\CSS\Post;
use Elementor\Element_Base;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Plugin;

class Atomic_Styles {
	/**
	 * @var array<string, array{direction: 'min' | 'max', value: int, is_enabled: boolean}> $breakpoints
	 */
	private array $breakpoints = [];

	private Styles_Renderer $styles_renderer;

	public function register_hooks() {
		add_action( 'elementor/element/parse_css', fn( Post $post, Element_Base $element ) => $this->parse_element_style( $post, $element ), 10, 2 );
	}

	private function get_breakpoints(): array {
		if ( count( $this->breakpoints ) === 0 ) {
			$this->breakpoints = $this->build_breakpoints();
		}

		return $this->breakpoints;
	}

	private function build_breakpoints(): array {
		return Plugin::$instance->breakpoints->get_breakpoints_config();
	}

	private function get_styles_renderer(): Styles_Renderer {
		if ( ! isset( $this->styles_renderer ) ) {
			$this->styles_renderer = $this->build_styles_renderer();
		}

		return $this->styles_renderer;
	}

	private function build_styles_renderer(): Styles_Renderer {
		$breakpoints = $this->get_breakpoints();

		return new Styles_Renderer( [
			'breakpoints' => $breakpoints,
		] );
	}

	private function parse_element_style( Post $post, Element_Base $element ) {
		if ( ! ( $element instanceof Atomic_Widget_Base ) || Post::class !== get_class( $post ) ) {
			return;
		}

		$styles = $element->get_raw_data()['styles'];

		if ( empty( $styles ) ) {
			return;
		}

		$post->get_stylesheet()->add_raw_css( $this->convert_styles_to_css( $styles ) );
	}

	private function convert_styles_to_css( array $styles ): string {
		$styles_renderer = $this->get_styles_renderer();

		return $styles_renderer->render( $styles );
	}
}

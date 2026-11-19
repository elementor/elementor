<?php

namespace Elementor\Modules\CompositeWidgets\Site;

use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Without access, copies of site widgets are skipped at render, the same way Pro's display conditions
 * hide an element: the copy stays in the page data, and neither it nor its children are rendered.
 */
class Site_Widgets_Visibility {
	/** @var string[] */
	private array $hidden_element_ids = [];

	public function register_hooks(): void {
		add_action( 'elementor/frontend/before_render', fn ( $element ) => $this->before_render( $element ) );
		add_action( 'elementor/frontend/after_render', fn ( $element ) => $this->after_render( $element ) );
	}

	private function before_render( Element_Base $element ): void {
		if ( ! $this->should_hide( $element ) ) {
			return;
		}

		add_filter( 'elementor/element/get_child_type', '__return_false' );
		add_filter( $this->get_should_render_hook( $element ), '__return_false' );

		$this->hidden_element_ids[] = $element->get_id();
	}

	private function after_render( Element_Base $element ): void {
		$index = array_search( $element->get_id(), $this->hidden_element_ids, true );

		if ( false === $index ) {
			return;
		}

		remove_filter( 'elementor/element/get_child_type', '__return_false' );
		remove_filter( $this->get_should_render_hook( $element ), '__return_false' );

		unset( $this->hidden_element_ids[ $index ] );
	}

	private function should_hide( Element_Base $element ): bool {
		return Site_Widget_Instances::is_site_widget_root( $element->get_data() )
			&& ! Site_Widgets_Access_Controller::can_display()
			&& ! Plugin::$instance->preview->is_preview_mode();
	}

	private function get_should_render_hook( Element_Base $element ): string {
		return 'elementor/frontend/' . $element->get_type() . '/should_render';
	}
}

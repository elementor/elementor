<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Promotions;

use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Preserved_Element extends Element_Base {

	public function get_name() {
		$widget_type = $this->get_data( 'widgetType' );

		if ( ! empty( $widget_type ) ) {
			return $widget_type;
		}

		$el_type = $this->get_data( 'elType' );

		return empty( $el_type ) ? 'e-preserved-element' : $el_type;
	}

	protected function _get_default_child_type( array $element_data ) {
		return new self();
	}

	public function get_controls( $control_id = null ) {
		return [];
	}

	public function get_data_for_save() {
		return $this->get_data();
	}

	public function get_raw_data( $with_html_content = false ) {
		return $this->get_data();
	}
}

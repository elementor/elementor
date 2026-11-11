<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Element_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Element_Base
 */
trait Has_Widget_Markers {
	private function add_widget_markers( array &$raw_data ): void {
		$widget = Widget_Markers::sanitize_widget( $this->get_data( Widget_Markers::WIDGET_KEY ) );
		$part = Widget_Markers::sanitize_part( $this->get_data( Widget_Markers::PART_KEY ) );

		if ( ! empty( $widget ) ) {
			$raw_data[ Widget_Markers::WIDGET_KEY ] = $widget;
		}

		if ( '' !== $part ) {
			$raw_data[ Widget_Markers::PART_KEY ] = $part;
		}

		if ( '' !== $part && Widget_Markers::sanitize_slot( $this->get_data( Widget_Markers::SLOT_KEY ) ) ) {
			$raw_data[ Widget_Markers::SLOT_KEY ] = true;
		}
	}
}

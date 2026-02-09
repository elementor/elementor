<?php

namespace Elementor\Modules\AtomicWidgets\Builder\Utils;

class WidgetDescriptorUtils {
	static function validate_widget_descriptor( $widget_descriptor ) {
		if ( ! is_array( $widget_descriptor ) ) {
			return false;
		}

		if ( ! is_callable( $widget_descriptor, 'define'  ) ) {
			return false;
		}
	}
}


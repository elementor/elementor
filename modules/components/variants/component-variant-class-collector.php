<?php

namespace Elementor\Modules\Components\Variants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Variant_Class_Collector {
	public static function collect( Component_Variants $variants ): array {
		$class_ids = [];

		foreach ( $variants->variants as $variant ) {
			foreach ( $variant->widgets as $widget_entry ) {
				$add_list = $widget_entry['settings']['classes'][ Component_Variant_Parser::ACTION_ADD ] ?? [];

				if ( ! is_array( $add_list ) ) {
					continue;
				}

				foreach ( $add_list as $class_id ) {
					if ( is_string( $class_id ) && '' !== $class_id ) {
						$class_ids[] = $class_id;
					}
				}
			}
		}

		return $class_ids;
	}
}

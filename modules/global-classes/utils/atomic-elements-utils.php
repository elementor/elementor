<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Schema_Resolver;
use Elementor\Plugin;

class Atomic_Elements_Utils {

	public static function is_classes_prop( $prop ) {
		// phpcs:ignore
		return 'plain' === $prop::$KIND && 'classes' === $prop->get_key();
	}

	public static function collect_class_ids_from_element_data( array $element_data ): array {
		$element_type = self::get_element_type( $element_data );
		$element_instance = self::get_element_instance( $element_type );

		if ( ! Atomic_Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		$schema = Schema_Resolver::get_widget_schema( $element_type );
		$settings = $element_data['settings'] ?? [];
		$class_ids = [];

		foreach ( $schema as $settings_key => $prop ) {
			if ( ! self::is_classes_prop( $prop ) ) {
				continue;
			}

			$values = $settings[ $settings_key ]['value'] ?? [];

			if ( ! is_array( $values ) ) {
				continue;
			}

			foreach ( $values as $class_id ) {
				if ( is_string( $class_id ) && '' !== $class_id ) {
					$class_ids[] = $class_id;
				}
			}
		}

		return $class_ids;
	}

	public static function get_element_type( $element ) {
		return 'widget' === $element['elType'] ? $element['widgetType'] : $element['elType'];
	}

	public static function get_element_instance( $element_type ) {
		$widget = Plugin::instance()->widgets_manager->get_widget_types( $element_type );
		$element = Plugin::instance()->elements_manager->get_element_types( $element_type );

		return $widget ?? $element;
	}

	public static function is_atomic_element( $element_instance ) {
		if ( ! $element_instance ) {
			return false;
		}

		return (
			$element_instance instanceof Atomic_Element_Base ||
			$element_instance instanceof Atomic_Widget_Base
		);
	}
}

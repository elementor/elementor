<?php

namespace Elementor\Modules\DynamicAssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Document_Widget_Type_Scanner {

	public function collect_widget_types_from_elements( array $elements ): array {
		$types = [];

		foreach ( $elements as $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( isset( $element['elType'] ) && 'widget' === $element['elType'] && ! empty( $element['widgetType'] ) ) {
				$types[ $element['widgetType'] ] = true;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				foreach ( $this->collect_widget_types_from_elements( $element['elements'] ) as $type => $_ ) {
					$types[ $type ] = true;
				}
			}
		}

		return array_keys( $types );
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Modules\GlobalClasses\Utils\Atomic_Elements_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Element_Structure_Title {

	public static function resolve( array $element ): ?string {
		$editor_title = $element['editor_settings']['title'] ?? null;

		if ( is_string( $editor_title ) && '' !== $editor_title ) {
			return $editor_title;
		}

		$settings = $element['settings'] ?? [];

		if ( is_array( $settings ) ) {
			foreach ( [ '_title', 'presetTitle' ] as $key ) {
				$plain = self::extract_plain_string( $settings[ $key ] ?? null );

				if ( null !== $plain ) {
					return $plain;
				}
			}
		}

		$type = $element['widgetType'] ?? $element['elType'] ?? null;

		if ( ! $type ) {
			return null;
		}

		$instance = Atomic_Elements_Utils::get_element_instance( (string) $type );

		if ( ! $instance ) {
			return null;
		}

		$label = $instance->get_title();

		if ( ! is_string( $label ) || '' === $label ) {
			return null;
		}

		return $label;
	}

	private static function extract_plain_string( $value ): ?string {
		if ( is_string( $value ) && '' !== $value ) {
			return $value;
		}

		if (
			is_array( $value )
			&& isset( $value['value'] )
			&& is_string( $value['value'] )
			&& '' !== $value['value']
		) {
			return $value['value'];
		}

		return null;
	}
}

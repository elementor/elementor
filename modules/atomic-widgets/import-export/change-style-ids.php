<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Change_Style_Ids {
	public static function make(): self {
		return new self();
	}

	public function run( array $element ) {
		[ $element, $old_to_new_ids ] = $this->change_styles( $element );

		return $this->change_settings_references( $element, $old_to_new_ids );
	}

	private function change_styles( array $element ): array {
		if ( empty( $element['styles'] ) || empty( $element['id'] ) ) {
			return [ $element, [] ];
		}

		$element_id = $element['id'];
		$styles = $element['styles'];
		$old_to_new_ids = [];

		foreach ( $styles as $style ) {
			$id = Utils::generate_id( "e-{$element_id}-", array_values( $old_to_new_ids ) );

			$old_id = $style['id'];

			$old_to_new_ids[ $old_id ] = $id;
			$style['id'] = $id;

			unset( $element['styles'][ $old_id ] );

			$element['styles'][ $id ] = $style;
		}

		return [ $element, $old_to_new_ids ];
	}

	private function change_settings_references( array $element, array $old_to_new_ids ): array {
		if ( empty( $element['settings'] ) ) {
			return $element;
		}

		$settings = $element['settings'];
		$settings_result = [];

		foreach ( $settings as $key => $setting ) {
			if (
				! isset( $setting['$$type'] ) ||
				Classes_Prop_Type::get_key() !== $setting['$$type'] ||
				! isset( $setting['value'] ) ||
				! is_array( $setting['value'] )
			) {
				$settings_result[ $key ] = $setting;

				continue;
			}

			$result = [];

			foreach ( $setting['value'] as $style_id ) {
				if ( ! isset( $old_to_new_ids[ $style_id ] ) ) {
					$result[] = $style_id;

					continue;
				}

				$result[] = $old_to_new_ids[ $style_id ];
			}

			$setting['value'] = $result;

			$settings_result[ $key ] = $setting;
		}

		$element['settings'] = $settings_result;

		return $element;
	}
}

<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Colors_Injector {
	public function register_hooks() {
		add_filter( 'elementor/globals/colors/items', [ $this, 'inject_v4_colors' ] );
	}

	public function inject_v4_colors( array $items ): array {
		$synced = Variables_Provider::get_synced_color_variables();

		if ( empty( $synced ) ) {
			return $items;
		}

		$v4_items = [];

		foreach ( $synced as $id => $variable ) {
			$label = sanitize_text_field( $variable['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$value = $variable['value'] ?? '';

			if ( is_array( $value ) && isset( $value['value'] ) ) {
				$value = $value['value'];
			}

			$v3_id = 'v4-' . $label;

			$v4_items[ $v3_id ] = [
				'id'    => $v3_id,
				'title' => $label,
				'value' => strtoupper( $value ),
				'group' => 'v4',
			];
		}

		return array_merge( $v4_items, $items );
	}
}

<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kit_Stylesheet_Extended {
	public function register_hooks() {
		add_action( 'elementor/css-file/post/parse', [ $this, 'add_v3_mapping_css' ] );
	}

	public function add_v3_mapping_css( $post_css ) {
		if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
			return;
		}

		$synced_variables = Variables_Provider::get_synced_color_variables();

		if ( empty( $synced_variables ) ) {
			return;
		}

		$css_entries = [];

		foreach ( $synced_variables as $id => $variable ) {
			$label = sanitize_text_field( $variable['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$v3_id = 'v4-' . $label;
			$type = $variable['type'];
			$global_type = $this->get_v3_global_type( $type ?? '' );

			$css_entries[] = "--e-global-{$global_type}-{$v3_id}:var(--{$label});";
		}

		if ( ! empty( $css_entries ) ) {
			$post_css->get_stylesheet()->add_raw_css(
				':root { ' . implode( ' ', $css_entries ) . ' }'
			);
		}
	}

	private function get_v3_global_type( string $type ): string {
		$type_map = [
			'global-color-variable' => 'color',
			'global-font-variable' => 'typography',
		];

		return $type_map[ $type ] ?? 'color';
	}
}


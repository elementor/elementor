<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kit_Stylesheet_Extended {
	public function register_hooks() {
		add_filter( 'elementor/variables/css_entry_additional', [ $this, 'add_v3_mapping_for_variable' ], 10, 3 );
	}

	public function add_v3_mapping_for_variable( string $css, array $variable, string $id ): string {
		if ( empty( $variable['sync_to_v3'] ) ) {
			return $css;
		}

		$label = sanitize_text_field( $variable['label'] ?? '' );

		if ( empty( $label ) ) {
			return $css;
		}

		$v3_id = 'v4-' . $label;
		$type = $variable['type'];
		$global_type = $this->get_v3_global_type( $type ?? '' );

		return $css . " --e-global-{$global_type}-{$v3_id}:var(--{$label});";
	}

	private function get_v3_global_type( string $type ): string {
		$type_map = [
			'global-color-variable' => 'color',
			'global-font-variable' => 'typography',
		];

		return $type_map[ $type ] ?? 'color';
	}
}

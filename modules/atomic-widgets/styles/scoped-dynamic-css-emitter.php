<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scoped_Dynamic_Css_Emitter {
	const DYNAMIC_VAR_PREFIX = '--e-dyn';

	/**
	 * @return array{
	 *   static_props: array,
	 *   placeholder_css: string,
	 *   definitions: array<string, array>
	 * }
	 */
	public function emit( array $props, string $class_id, int $variant_index ): array {
		$static_props = [];
		$placeholder_css = '';
		$definitions = [];

		foreach ( $props as $prop_name => $prop_value ) {
			if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $prop_value ) ) {
				$static_props[ $prop_name ] = $prop_value;
				continue;
			}

			$var_name = $this->generate_variable_name( $class_id, $variant_index, $prop_name );
			$definitions[ $var_name ] = $prop_value;
			$placeholder_css .= $prop_name . ':var(' . $var_name . ');';
		}

		return [
			'static_props' => $static_props,
			'placeholder_css' => $placeholder_css,
			'definitions' => $definitions,
		];
	}

	private function generate_variable_name( string $class_id, int $variant_index, string $prop_name ): string {
		$safe_class = preg_replace( '/[^a-zA-Z0-9_-]/', '', $class_id );
		$safe_prop = preg_replace( '/[^a-zA-Z0-9_-]/', '', $prop_name );

		return self::DYNAMIC_VAR_PREFIX . '-' . $safe_class . '-v' . $variant_index . '-' . $safe_prop;
	}
}

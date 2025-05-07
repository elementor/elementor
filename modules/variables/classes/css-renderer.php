<?php

namespace Elementor\Modules\Variables\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class CSS_Renderer {
	private Variables $variables;

	public function __construct( Variables $variables ) {
		$this->variables = $variables;
	}

	private function global_variables(): array {
		return $this->variables->get_all();
	}

	public function raw_css(): string {
		$list_of_variables = $this->global_variables();

		if ( empty( $list_of_variables ) ) {
			return '';
		}

		$css_entries = [];

		foreach ( $list_of_variables as $idx => $variable ) {
			$variable_name = sanitize_text_field( $idx );
			$value = sanitize_text_field( $variable['value'] );

			if ( empty( $value ) || empty( $variable_name ) ) {
				continue;
			}

			$css_entries[] = '--' . $variable_name . ':' . $value . ';';
		}

		if ( empty( $css_entries ) ) {
			return '';
		}

		return ':root { ' . implode( ' ', $css_entries ) . ' }';
	}
}

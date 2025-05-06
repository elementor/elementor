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

		$css_string = ':root { ';

		foreach ( $list_of_variables as $idx => $variable ) {
			$css_string .= '--' . $idx . ':' . $variable['value'] . '; ';
		}

		$css_string .= '}';

		return $css_string;
	}
}

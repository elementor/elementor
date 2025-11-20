<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Traits\Css_Variable_Handling_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Variable_Aware_Color_Prop_Type extends Color_Prop_Type {

	use Css_Variable_Handling_Trait;

	public static function get_key(): string {
		return 'color';
	}

	protected function sanitize_value( $value ) {
		if ( $this->is_css_variable( $value ) ) {
			return $this->sanitize_css_variable( $value );
		}

		return parent::sanitize_value( $value );
	}

	protected function validate_value( $value ): bool {
		if ( $this->is_css_variable( $value ) ) {
			return $this->validate_css_variable( $value );
		}

		return parent::validate_value( $value );
	}
}

<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Traits;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Css_Variable_Handling_Trait {

	private function is_css_variable( $value ): bool {
		return is_string( $value ) && str_starts_with( trim( $value ), 'var(' );
	}

	private function sanitize_css_variable( $value ): string {
		$trimmed = trim( $value );

		if ( ! $this->is_elementor_css_variable( $trimmed ) ) {
			error_log( '⚠️  CSS Variable Handler: Non-Elementor CSS variable detected: ' . $trimmed );
		}

		return $trimmed;
	}

	private function validate_css_variable( $value ): bool {
		$trimmed = trim( $value );

		if ( ! preg_match( '/^var\s*\(\s*--[a-zA-Z0-9_-]+(?:\s*,\s*[^)]+)?\s*\)$/', $trimmed ) ) {
			error_log( '❌ CSS Variable Handler: Invalid CSS variable syntax: ' . $trimmed );
			return false;
		}

		if ( ! $this->is_elementor_css_variable( $trimmed ) ) {
			error_log( '⚠️  CSS Variable Handler: Non-Elementor CSS variable (allowed but not recommended): ' . $trimmed );
		}

		error_log( '✅ CSS Variable Handler: Valid CSS variable: ' . $trimmed );
		return true;
	}

	private function is_elementor_css_variable( $value ): bool {
		return (
			false !== strpos( $value, '--e-global-' ) ||
			false !== strpos( $value, '--elementor-' ) ||
			false !== strpos( $value, '--e-theme-' )
		);
	}
}

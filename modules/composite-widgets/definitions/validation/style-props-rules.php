<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * `Style_Parser` only walks the style schema's keys, so an unknown style prop passes it silently.
 * This rule owns the style schema lookups shared by template local styles, presets and quick edit.
 */
class Style_Props_Rules {
	private ?array $style_schema = null;

	public function is_known_prop( $style_prop ): bool {
		return is_string( $style_prop ) && isset( $this->get_style_schema()[ $style_prop ] );
	}

	public function validate_known_props( array $props, string $path, Parse_Errors $errors, string $error_code ): void {
		foreach ( array_keys( $props ) as $style_prop ) {
			if ( ! $this->is_known_prop( $style_prop ) ) {
				$errors->add( "{$path}.{$style_prop}", $error_code );
			}
		}
	}

	public function validate_props( array $props, string $path, Parse_Errors $errors, string $error_code ): void {
		foreach ( $props as $style_prop => $value ) {
			if ( ! $this->is_known_prop( $style_prop ) || ! $this->get_style_schema()[ $style_prop ]->validate( $value ) ) {
				$errors->add( "{$path}.{$style_prop}", $error_code );
			}
		}
	}

	private function get_style_schema(): array {
		if ( null === $this->style_schema ) {
			$this->style_schema = Style_Schema::get();
		}

		return $this->style_schema;
	}
}

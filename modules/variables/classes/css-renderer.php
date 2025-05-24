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

	private function get_variables(): array {
		return $this->variables->get_all();
	}

	public function raw_css(): string {
		$list_of_variables = $this->get_variables();

		if ( empty( $list_of_variables ) ) {
			return '';
		}

		$css_entries = $this->css_entries_for( $list_of_variables );

		if ( empty( $css_entries ) ) {
			return '';
		}

		return $this->wrap_with_root( $css_entries );
	}

	private function css_entries_for( array $list_of_variables ): array {
		$entries = [];

		foreach ( $list_of_variables as $variable_id => $variable ) {
			$entry = $this->build_css_variable_entry( $variable_id, $variable );

			if ( empty( $entry ) ) {
				continue;
			}

			$entries[] = $entry;
		}

		return $entries;
	}

	private function build_css_variable_entry( string $id, array $variable ): ?string {
		$id = sanitize_text_field( $id );
		$value = sanitize_text_field( $variable['value'] ?? '' );
		$label = $this->normalize_label_to_css_var( $variable['label'] );

		if ( empty( $value ) || empty( $label ) || empty( $id ) ) {
			return null;
		}

		return "--{$label}:{$value};";
	}

	private function normalize_label_to_css_var( $label ): string {
		$label = strtolower( $label );
		$label = preg_replace( '/[^a-z0-9]+/', '-', $label );

		return trim( $label, '-' );
	}

	private function wrap_with_root( array $css_entries ): string {
		return ':root { ' . implode( ' ', $css_entries ) . ' }';
	}
}

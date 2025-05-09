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
		$variable_groups = $this->global_variables();

		if ( empty( $variable_groups ) ) {
			return '';
		}

		$css_entries = $this->generate_css_entries( $variable_groups );

		if ( empty( $css_entries ) ) {
			return '';
		}

		return $this->wrap_with_root( $css_entries );
	}

	private function generate_css_entries( array $groups ): array {
		$entries = [];

		foreach ( $groups as $group ) {
			$entries = array_merge( $entries, $this->process_variable_group( $group ) );
		}

		return $entries;
	}

	private function process_variable_group( array $group ): array {
		$entries = [];

		foreach ( $group as $name => $variable ) {
			var_dump( $variable );

			$entry = $this->build_css_variable_entry( $name, $variable );

			if ( $entry ) {
				$entries[] = $entry;
			}
		}

		return $entries;
	}

	private function build_css_variable_entry( string $name, array $variable ): ?string {
		$variable_name = sanitize_text_field( $name );
		$value = sanitize_text_field( $variable['value'] ?? '' );

		if ( empty( $value ) || empty( $variable_name ) ) {
			return null;
		}

		return "--{$variable_name}:{$value};";
	}

	private function wrap_with_root( array $css_entries ): string {
		return ':root { ' . implode( ' ', $css_entries ) . ' }';
	}
}

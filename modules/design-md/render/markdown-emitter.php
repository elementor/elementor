<?php
namespace Elementor\Modules\DesignMd\Render;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Emitter {

	public function emit( array $tokens ): string {
		$sections = [
			$this->render_overview_section( $tokens ),
			$this->render_colors_section( $tokens ),
			$this->render_typography_section( $tokens ),
			$this->render_layout_section( $tokens ),
			$this->render_components_section( $tokens ),
		];

		return "\n" . implode( "\n\n", array_filter( $sections ) ) . "\n";
	}

	private function render_overview_section( array $tokens ): string {
		$description = $tokens['description'] ?? '';
		$name        = $tokens['name'] ?? '';

		$lines = [ '## Overview' ];

		if ( $description ) {
			$lines[] = '';
			$lines[] = $description;
		} elseif ( $name ) {
			$lines[] = '';
			$lines[] = 'Design system for ' . $name . '.';
		}

		return implode( "\n", $lines );
	}

	private function render_colors_section( array $tokens ): string {
		$colors = $tokens['colors'] ?? [];
		if ( ! $colors ) {
			return '';
		}

		$lines        = [ '## Colors', '' ];
		$color_titles = $tokens['color_titles'] ?? [];

		foreach ( $colors as $id => $hex ) {
			$title   = $color_titles[ $id ] ?? '';
			$lines[] = '- **' . $id . '** (' . $hex . '): ' . $title;
		}

		return implode( "\n", $lines );
	}

	private function render_typography_section( array $tokens ): string {
		$typography = $tokens['typography'] ?? [];
		$bullets    = [];

		foreach ( $typography as $name => $props ) {
			$desc_parts = [];
			if ( ! empty( $props['fontFamily'] ) ) {
				$desc_parts[] = $props['fontFamily'];
			}
			if ( ! empty( $props['fontWeight'] ) ) {
				$desc_parts[] = 'weight ' . $props['fontWeight'];
			}
			if ( ! empty( $props['fontSize'] ) ) {
				$desc_parts[] = $props['fontSize'];
			}
			if ( $desc_parts ) {
				$bullets[] = '- **' . $name . ':** ' . implode( ', ', $desc_parts );
			}
		}

		if ( ! $bullets ) {
			return '';
		}

		return implode( "\n", array_merge( [ '## Typography', '' ], $bullets ) );
	}

	private function render_layout_section( array $tokens ): string {
		$spacing = $tokens['spacing'] ?? [];
		if ( ! $spacing ) {
			return '';
		}

		$lines = [ '## Layout', '' ];

		if ( ! empty( $spacing['container'] ) ) {
			$lines[] = 'Content area max width: ' . $spacing['container'] . '.';
		}

		$scale_items = array_diff_key( $spacing, [ 'container' => true ] );
		if ( $scale_items ) {
			$lines[] = '';
			$lines[] = 'Spacing scale:';
			foreach ( $scale_items as $level => $value ) {
				$lines[] = '- **' . $level . ':** ' . $value;
			}
		}

		return implode( "\n", $lines );
	}

	private function render_components_section( array $tokens ): string {
		$components = $tokens['components'] ?? [];
		if ( ! $components ) {
			return '';
		}

		$parts = [ '## Components' ];

		foreach ( $components as $name => $props ) {
			$component_lines = [ '', '### ' . $name, '' ];

			foreach ( $props as $prop_name => $prop_value ) {
				$component_lines[] = '- **' . $prop_name . ':** `' . $prop_value . '`';
			}

			$parts[] = implode( "\n", $component_lines );
		}

		return implode( "\n", $parts );
	}
}

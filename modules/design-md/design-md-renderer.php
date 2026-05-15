<?php
namespace Elementor\Modules\DesignMd;

use Elementor\Core\Kits\Documents\Kit;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Design_Md_Renderer {

	private const TYPOGRAPHY_PREFIX = 'typography_';

	public function render( Kit $kit ): string {
		$settings = $kit->get_settings();
		$tokens = $this->build_tokens( $settings );
		$frontmatter = $this->render_yaml_frontmatter( $tokens );
		$body = $this->render_markdown_body( $tokens );

		return $frontmatter . "\n" . $body;
	}

	private function build_tokens( array $settings ): array {
		$tokens = [];

		$tokens['name'] = $this->get_site_name( $settings );

		$description = $this->get_site_description( $settings );
		if ( $description ) {
			$tokens['description'] = $description;
		}

		$colors = $this->build_color_tokens( $settings );
		if ( $colors ) {
			$tokens['colors'] = $colors;
		}

		$typography = $this->build_typography_tokens( $settings );
		if ( $typography ) {
			$tokens['typography'] = $typography;
		}

		$rounded = $this->build_rounded_tokens( $settings );
		if ( $rounded ) {
			$tokens['rounded'] = $rounded;
		}

		$spacing = $this->build_spacing_tokens( $settings );
		if ( $spacing ) {
			$tokens['spacing'] = $spacing;
		}

		$components = $this->build_component_tokens( $settings );
		if ( $components ) {
			$tokens['components'] = $components;
		}

		return $tokens;
	}

	private function get_site_name( array $settings ): string {
		$name = $settings['site_name'] ?? '';

		return ! empty( $name ) ? $name : get_bloginfo( 'name' );
	}

	private function get_site_description( array $settings ): string {
		$description = $settings['site_description'] ?? '';

		return ! empty( $description ) ? $description : get_bloginfo( 'description' );
	}

	private function build_color_tokens( array $settings ): array {
		$colors = [];

		$system_colors = $settings['system_colors'] ?? [];
		foreach ( $system_colors as $item ) {
			if ( empty( $item['color'] ) || empty( $item['_id'] ) ) {
				continue;
			}
			$colors[ $item['_id'] ] = $item['color'];
		}

		$custom_colors = $settings['custom_colors'] ?? [];
		foreach ( $custom_colors as $item ) {
			if ( empty( $item['color'] ) ) {
				continue;
			}
			$key = ! empty( $item['_id'] ) ? $item['_id'] : $this->slugify( $item['title'] ?? '' );
			if ( $key ) {
				$colors[ $key ] = $item['color'];
			}
		}

		return $colors;
	}

	private function build_typography_tokens( array $settings ): array {
		$typography = [];

		$system_typography = $settings['system_typography'] ?? [];
		foreach ( $system_typography as $item ) {
			$id = $item['_id'] ?? '';
			if ( ! $id ) {
				continue;
			}
			$props = $this->extract_typography_props( $item, self::TYPOGRAPHY_PREFIX );
			if ( $props ) {
				$typography[ $id ] = $props;
			}
		}

		$custom_typography = $settings['custom_typography'] ?? [];
		foreach ( $custom_typography as $item ) {
			$id = ! empty( $item['_id'] ) ? $item['_id'] : $this->slugify( $item['title'] ?? '' );
			if ( ! $id ) {
				continue;
			}
			$props = $this->extract_typography_props( $item, self::TYPOGRAPHY_PREFIX );
			if ( $props ) {
				$typography[ $id ] = $props;
			}
		}

		$heading_levels = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
		foreach ( $heading_levels as $level ) {
			$props = $this->extract_group_typography( $settings, $level . '_typography_' );
			if ( $props ) {
				$typography[ $level ] = $props;
			}
		}

		$body_props = $this->extract_group_typography( $settings, 'body_typography_' );
		if ( $body_props ) {
			$typography['body-md'] = $body_props;
		}

		return $typography;
	}

	private function extract_typography_props( array $item, string $prefix ): array {
		$props = [];

		$font_family = $item[ $prefix . 'font_family' ] ?? '';
		if ( $font_family ) {
			$props['fontFamily'] = $font_family;
		}

		$font_size = $this->extract_dimension( $item, $prefix . 'font_size' );
		if ( $font_size ) {
			$props['fontSize'] = $font_size;
		}

		$font_weight = $item[ $prefix . 'font_weight' ] ?? '';
		if ( $font_weight ) {
			$props['fontWeight'] = (int) $font_weight;
		}

		$line_height = $this->extract_dimension( $item, $prefix . 'line_height' );
		if ( $line_height ) {
			$props['lineHeight'] = $line_height;
		}

		$letter_spacing = $this->extract_dimension( $item, $prefix . 'letter_spacing' );
		if ( $letter_spacing ) {
			$props['letterSpacing'] = $letter_spacing;
		}

		return $props;
	}

	private function extract_group_typography( array $settings, string $prefix ): array {
		$props = [];

		$font_family = $settings[ $prefix . 'font_family' ] ?? '';
		if ( $font_family ) {
			$props['fontFamily'] = $font_family;
		}

		$font_size = $this->extract_dimension( $settings, $prefix . 'font_size' );
		if ( $font_size ) {
			$props['fontSize'] = $font_size;
		}

		$font_weight = $settings[ $prefix . 'font_weight' ] ?? '';
		if ( $font_weight ) {
			$props['fontWeight'] = (int) $font_weight;
		}

		$line_height = $this->extract_dimension( $settings, $prefix . 'line_height' );
		if ( $line_height ) {
			$props['lineHeight'] = $line_height;
		}

		$letter_spacing = $this->extract_dimension( $settings, $prefix . 'letter_spacing' );
		if ( $letter_spacing ) {
			$props['letterSpacing'] = $letter_spacing;
		}

		return $props;
	}

	private function build_rounded_tokens( array $settings ): array {
		$rounded = [];

		$radius = $settings['button_border_radius'] ?? [];
		if ( ! empty( $radius['top'] ) ) {
			$unit = $radius['unit'] ?? 'px';
			$rounded['md'] = $radius['top'] . $unit;
		}

		return $rounded;
	}

	private function build_spacing_tokens( array $settings ): array {
		$spacing = [];

		$gaps = $settings['space_between_widgets'] ?? [];
		if ( ! empty( $gaps['column'] ) ) {
			$unit = $gaps['unit'] ?? 'px';
			$spacing['md'] = $gaps['column'] . $unit;

			$half = (int) $gaps['column'] / 2;
			if ( $half > 0 ) {
				$spacing['sm'] = $half . $unit;
			}
		}

		$container_width = $settings['container_width'] ?? [];
		if ( ! empty( $container_width['size'] ) ) {
			$unit = $container_width['unit'] ?? 'px';
			$spacing['container'] = $container_width['size'] . $unit;
		}

		return $spacing;
	}

	private function build_component_tokens( array $settings ): array {
		$components = [];

		$button = $this->build_button_component( $settings );
		if ( $button ) {
			$components['button-primary'] = $button;
		}

		$button_hover = $this->build_button_hover_component( $settings );
		if ( $button_hover ) {
			$components['button-primary-hover'] = $button_hover;
		}

		return $components;
	}

	private function build_button_component( array $settings ): array {
		$component = [];

		$bg_color = $settings['button_background_color'] ?? '';
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = $settings['button_text_color'] ?? '';
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$radius = $settings['button_border_radius'] ?? [];
		if ( ! empty( $radius['top'] ) ) {
			$component['rounded'] = '{rounded.md}';
		}

		$padding = $settings['button_padding'] ?? [];
		if ( ! empty( $padding['top'] ) ) {
			$unit = $padding['unit'] ?? 'px';
			$component['padding'] = $padding['top'] . $unit;
		}

		return $component;
	}

	private function build_button_hover_component( array $settings ): array {
		$component = [];

		$bg_color = $settings['button_hover_background_color'] ?? '';
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = $settings['button_hover_text_color'] ?? '';
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		return $component;
	}

	private function extract_dimension( array $data, string $key ): string {
		$value = $data[ $key ] ?? '';

		if ( is_array( $value ) ) {
			if ( empty( $value['size'] ) ) {
				return '';
			}
			$unit = $value['unit'] ?? 'px';

			return $value['size'] . $unit;
		}

		if ( '' === $value || null === $value ) {
			return '';
		}

		return (string) $value;
	}

	private function render_yaml_frontmatter( array $tokens ): string {
		$lines = [ '---' ];
		$this->yaml_write_tokens( $lines, $tokens, 0 );
		$lines[] = '---';

		return implode( "\n", $lines );
	}

	private function yaml_write_tokens( array &$lines, array $data, int $depth ): void {
		$indent = str_repeat( '  ', $depth );

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$lines[] = $indent . $key . ':';
				$this->yaml_write_tokens( $lines, $value, $depth + 1 );
			} elseif ( is_int( $value ) ) {
				$lines[] = $indent . $key . ': ' . $value;
			} else {
				$lines[] = $indent . $key . ': ' . $this->yaml_quote( (string) $value );
			}
		}
	}

	private function yaml_quote( string $value ): string {
		if ( str_starts_with( $value, '#' ) || str_starts_with( $value, '{' ) || str_contains( $value, ':' ) || str_contains( $value, '"' ) ) {
			return '"' . addcslashes( $value, '"\\' ) . '"';
		}

		return $value;
	}

	private function render_markdown_body( array $tokens ): string {
		$sections = [];

		$sections[] = $this->render_overview_section( $tokens );
		$sections[] = $this->render_colors_section( $tokens );
		$sections[] = $this->render_typography_section( $tokens );
		$sections[] = $this->render_layout_section( $tokens );
		$sections[] = $this->render_components_section( $tokens );

		return implode( "\n\n", array_filter( $sections ) ) . "\n";
	}

	private function render_overview_section( array $tokens ): string {
		$description = $tokens['description'] ?? '';
		$name = $tokens['name'] ?? '';

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

		$lines = [ '## Colors', '' ];

		foreach ( $colors as $name => $hex ) {
			$lines[] = '- **' . ucfirst( $name ) . ' (' . $hex . ')**';
		}

		return implode( "\n", $lines );
	}

	private function render_typography_section( array $tokens ): string {
		$typography = $tokens['typography'] ?? [];
		if ( ! $typography ) {
			return '';
		}

		$lines = [ '## Typography', '' ];

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
			$lines[] = '- **' . $name . ':** ' . implode( ', ', $desc_parts );
		}

		return implode( "\n", $lines );
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

	private function slugify( string $text ): string {
		$text = strtolower( trim( $text ) );
		$text = preg_replace( '/[^a-z0-9]+/', '-', $text );

		return trim( $text, '-' );
	}
}

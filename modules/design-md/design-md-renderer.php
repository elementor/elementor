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

		$color_titles = $this->build_color_title_map( $settings );
		if ( $color_titles ) {
			$tokens['color_titles'] = $color_titles;
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

	private function build_color_title_map( array $settings ): array {
		$titles = [];

		$system_colors = $settings['system_colors'] ?? [];
		foreach ( $system_colors as $item ) {
			if ( empty( $item['color'] ) || empty( $item['_id'] ) ) {
				continue;
			}
			$titles[ $item['_id'] ] = $item['title'] ?? '';
		}

		$custom_colors = $settings['custom_colors'] ?? [];
		foreach ( $custom_colors as $item ) {
			if ( empty( $item['color'] ) ) {
				continue;
			}
			$key = ! empty( $item['_id'] ) ? $item['_id'] : $this->slugify( $item['title'] ?? '' );
			if ( $key ) {
				$titles[ $key ] = $item['title'] ?? '';
			}
		}

		return $titles;
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

		$body = $this->build_body_component( $settings );
		if ( $body ) {
			$components['body'] = $body;
		}

		$link = $this->build_link_component( $settings );
		if ( $link ) {
			$components['link'] = $link;
		}

		$link_hover = $this->build_link_hover_component( $settings );
		if ( $link_hover ) {
			$components['link-hover'] = $link_hover;
		}

		$heading_levels = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ];
		foreach ( $heading_levels as $level ) {
			$heading = $this->build_heading_component( $settings, $level );
			if ( $heading ) {
				$components[ $level ] = $heading;
			}
		}

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

		$bg_color = $this->resolve_color_value( $settings, 'button_background_color' );
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = $this->resolve_color_value( $settings, 'button_text_color' );
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

		$typo_ref = $this->resolve_typography_reference( $settings, 'button_typography' );
		if ( $typo_ref ) {
			$component['typography'] = $typo_ref;
		} else {
			$typography = $this->extract_group_typography( $settings, 'button_typography_' );
			$component = array_merge( $component, $typography );
		}

		$border_type = $settings['button_border_border'] ?? '';
		if ( $border_type ) {
			$component['borderType'] = $border_type;
		}

		$border_width = $settings['button_border_width'] ?? [];
		if ( ! empty( $border_width['top'] ) ) {
			$unit = $border_width['unit'] ?? 'px';
			$component['borderWidth'] = $border_width['top'] . $unit;
		}

		$border_color = $this->resolve_color_value( $settings, 'button_border_color' );
		if ( $border_color ) {
			$component['borderColor'] = $border_color;
		}

		return $component;
	}

	private function build_button_hover_component( array $settings ): array {
		$component = [];

		$bg_color = $this->resolve_color_value( $settings, 'button_hover_background_color' );
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = $this->resolve_color_value( $settings, 'button_hover_text_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$border_type = $settings['button_hover_border_border'] ?? '';
		if ( $border_type ) {
			$component['borderType'] = $border_type;
		}

		$border_width = $settings['button_hover_border_width'] ?? [];
		if ( ! empty( $border_width['top'] ) ) {
			$unit = $border_width['unit'] ?? 'px';
			$component['borderWidth'] = $border_width['top'] . $unit;
		}

		$border_color = $this->resolve_color_value( $settings, 'button_hover_border_color' );
		if ( $border_color ) {
			$component['borderColor'] = $border_color;
		}

		$radius = $settings['button_hover_border_radius'] ?? [];
		if ( ! empty( $radius['top'] ) ) {
			$unit = $radius['unit'] ?? 'px';
			$component['rounded'] = $radius['top'] . $unit;
		}

		return $component;
	}

	private function build_body_component( array $settings ): array {
		$component = [];

		$text_color = $this->resolve_color_value( $settings, 'body_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$typo_ref = $this->resolve_typography_reference( $settings, 'body_typography' );
		if ( $typo_ref ) {
			$component['typography'] = $typo_ref;
		} else {
			$typography = $this->extract_group_typography( $settings, 'body_typography_' );
			$component = array_merge( $component, $typography );
		}

		$paragraph_spacing = $this->extract_dimension( $settings, 'paragraph_spacing' );
		if ( $paragraph_spacing ) {
			$component['paragraphSpacing'] = $paragraph_spacing;
		}

		return $component;
	}

	private function build_link_component( array $settings ): array {
		$component = [];

		$text_color = $this->resolve_color_value( $settings, 'link_normal_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$typo_ref = $this->resolve_typography_reference( $settings, 'link_normal_typography' );
		if ( $typo_ref ) {
			$component['typography'] = $typo_ref;
		} else {
			$typography = $this->extract_group_typography( $settings, 'link_normal_typography_' );
			$component = array_merge( $component, $typography );
		}

		return $component;
	}

	private function build_link_hover_component( array $settings ): array {
		$component = [];

		$text_color = $this->resolve_color_value( $settings, 'link_hover_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$typo_ref = $this->resolve_typography_reference( $settings, 'link_hover_typography' );
		if ( $typo_ref ) {
			$component['typography'] = $typo_ref;
		} else {
			$typography = $this->extract_group_typography( $settings, 'link_hover_typography_' );
			$component = array_merge( $component, $typography );
		}

		return $component;
	}

	private function build_heading_component( array $settings, string $prefix ): array {
		$component = [];

		$text_color = $this->resolve_color_value( $settings, $prefix . '_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$typo_ref = $this->resolve_typography_reference( $settings, $prefix . '_typography' );
		if ( $typo_ref ) {
			$component['typography'] = $typo_ref;
		} else {
			$typography = $this->extract_group_typography( $settings, $prefix . '_typography_' );
			$component = array_merge( $component, $typography );
		}

		return $component;
	}

	private function resolve_color_value( array $settings, string $key ): string {
		$global = $settings['__globals__'][ $key ] ?? '';
		if ( $global && preg_match( '/globals\/colors\?id=(.+)/', $global, $matches ) ) {
			return '{colors.' . $matches[1] . '}';
		}

		return $settings[ $key ] ?? '';
	}

	private function resolve_typography_reference( array $settings, string $group_name ): string {
		$global_key = $group_name . '_typography';
		$global = $settings['__globals__'][ $global_key ] ?? '';
		if ( $global && preg_match( '/globals\/typography\?id=(.+)/', $global, $matches ) ) {
			return '{typography.' . $matches[1] . '}';
		}

		return '';
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
		$yaml_tokens = array_diff_key( $tokens, array_flip( [ 'color_titles' ] ) );
		$lines = [ '---' ];
		$this->yaml_write_tokens( $lines, $yaml_tokens, 0 );
		$lines[] = '---';

		return implode( "\n", $lines );
	}

	private function yaml_write_tokens( array &$lines, array $data, int $depth ): void {
		$indent = str_repeat( '  ', $depth );

		foreach ( $data as $key => $value ) {
			$safe_key = $this->yaml_key( (string) $key );

			if ( is_array( $value ) ) {
				$lines[] = $indent . $safe_key . ':';
				$this->yaml_write_tokens( $lines, $value, $depth + 1 );
			} elseif ( is_int( $value ) ) {
				$lines[] = $indent . $safe_key . ': ' . $value;
			} else {
				$lines[] = $indent . $safe_key . ': ' . $this->yaml_quote( (string) $value );
			}
		}
	}

	private function yaml_quote( string $value ): string {
		if ( '' === $value ) {
			return '""';
		}

		return '"' . str_replace(
			[ '\\', '"', "\n", "\r", "\t" ],
			[ '\\\\', '\\"', '\\n', '\\r', '\\t' ],
			$value
		) . '"';
	}

	private function yaml_key( string $key ): string {
		if ( '' === $key ) {
			return '""';
		}

		if ( preg_match( '/^[A-Za-z0-9_\-]+$/', $key ) ) {
			return $key;
		}

		return $this->yaml_quote( $key );
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

		$lines = [ "\n", '## Overview' ];

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

		$color_titles = $tokens['color_titles'] ?? [];

		foreach ( $colors as $id => $hex ) {
			$title = $color_titles[ $id ] ?? '';
			$lines[] = '- **' . $id . '** (' . $hex . '): ' . $title;
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
		$slug = preg_replace( '/[^a-z0-9]+/', '-', $text );

		if ( ! is_string( $slug ) ) {
			$slug = $text;
		}

		return trim( $slug, '-' );
	}
}

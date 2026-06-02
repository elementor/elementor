<?php
namespace Elementor\Modules\DesignMd\TokenBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Token_Builder {

	const TYPOGRAPHY_ITEM_PREFIX = 'typography_';

	public function build( array $settings ): array {
		$tokens = [];

		$tokens['name'] = $this->get_site_name( $settings );

		$description = $this->get_site_description( $settings );
		if ( $description ) {
			$tokens['description'] = $description;
		}

		[ 'colors' => $colors, 'titles' => $color_titles ] = $this->build_color_items( $settings );

		if ( $colors ) {
			$tokens['colors']       = $colors;
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

		$components = $this->build_component_tokens( $settings, $typography ?? [] );
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

	private function build_color_items( array $settings ): array {
		$colors = [];
		$titles = [];

		foreach ( ( $settings['system_colors'] ?? [] ) as $item ) {
			if ( empty( $item['color'] ) || empty( $item['_id'] ) ) {
				continue;
			}
			$colors[ $item['_id'] ] = $item['color'];
			$titles[ $item['_id'] ] = $item['title'] ?? '';
		}

		foreach ( ( $settings['custom_colors'] ?? [] ) as $item ) {
			if ( empty( $item['color'] ) ) {
				continue;
			}
			$key = ! empty( $item['_id'] ) ? $item['_id'] : sanitize_title( $item['title'] ?? '' );
			if ( $key ) {
				$colors[ $key ] = $item['color'];
				$titles[ $key ] = $item['title'] ?? '';
			}
		}

		return [
			'colors' => $colors,
			'titles' => $titles,
		];
	}

	private function build_typography_tokens( array $settings ): array {
		$typography = [];

		foreach ( ( $settings['system_typography'] ?? [] ) as $item ) {
			$id = $item['_id'] ?? '';
			if ( ! $id ) {
				continue;
			}
			$typography[ $id ] = Kit_Settings_Reader::extract_typography_props( $item, self::TYPOGRAPHY_ITEM_PREFIX );
		}

		foreach ( ( $settings['custom_typography'] ?? [] ) as $item ) {
			$id = ! empty( $item['_id'] ) ? $item['_id'] : sanitize_title( $item['title'] ?? '' );
			if ( ! $id ) {
				continue;
			}
			$typography[ $id ] = Kit_Settings_Reader::extract_typography_props( $item, self::TYPOGRAPHY_ITEM_PREFIX );
		}

		return $typography;
	}

	private function build_rounded_tokens( array $settings ): array {
		$rounded = [];

		$value = Kit_Settings_Reader::dimension_to_string( $settings, 'button_border_radius', 'top' );
		if ( $value ) {
			$rounded['md'] = $value;
		}

		return $rounded;
	}

	private function build_spacing_tokens( array $settings ): array {
		$spacing = [];

		$gaps = $settings['space_between_widgets'] ?? [];
		if ( ! empty( $gaps['column'] ) ) {
			$unit          = $gaps['unit'] ?? Kit_Settings_Reader::DEFAULT_UNIT;
			$spacing['md'] = $gaps['column'] . $unit;
			$half          = (int) ( $gaps['column'] / 2 );
			if ( $half > 0 ) {
				$spacing['sm'] = $half . $unit;
			}
		}

		$container = Kit_Settings_Reader::dimension_to_string( $settings, 'container_width' );
		if ( $container ) {
			$spacing['container'] = $container;
		}

		return $spacing;
	}

	private function build_component_tokens( array $settings, array $typography_tokens ): array {
		$builder = new Component_Builder( $typography_tokens );

		$component_map = [
			'body'                 => fn( $s ) => $builder->build_body( $s ),
			'link'                 => fn( $s ) => $builder->build_link( $s ),
			'link-hover'           => fn( $s ) => $builder->build_link_hover( $s ),
			'h1'                   => fn( $s ) => $builder->build_heading( $s, 'h1' ),
			'h2'                   => fn( $s ) => $builder->build_heading( $s, 'h2' ),
			'h3'                   => fn( $s ) => $builder->build_heading( $s, 'h3' ),
			'h4'                   => fn( $s ) => $builder->build_heading( $s, 'h4' ),
			'h5'                   => fn( $s ) => $builder->build_heading( $s, 'h5' ),
			'h6'                   => fn( $s ) => $builder->build_heading( $s, 'h6' ),
			'button-primary'       => fn( $s ) => $builder->build_button( $s ),
			'button-primary-hover' => fn( $s ) => $builder->build_button_hover( $s ),
		];

		$components = [];
		foreach ( $component_map as $key => $build ) {
			$component = $build( $settings );
			if ( $component ) {
				$components[ $key ] = $component;
			}
		}

		return $components;
	}
}

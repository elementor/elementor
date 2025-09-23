<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Settings_Preparer {

	private HTML_To_Atomic_Widget_Mapper $widget_mapper;

	public function __construct() {
		$this->widget_mapper = new HTML_To_Atomic_Widget_Mapper();
	}

	public function prepare_widget_settings( string $widget_type, array $atomic_props, string $content, array $attributes = [] ): array {
		$settings = [];
		
		// Add content based on widget type
		$settings = $this->add_content_settings( $settings, $widget_type, $content, $attributes );
		
		// Add atomic props as settings
		foreach ( $atomic_props as $prop_name => $atomic_prop ) {
			$settings[ $prop_name ] = $atomic_prop;
		}
		
		// Add default settings for widget type
		$settings = $this->add_default_settings( $settings, $widget_type );
		
		// Add classes array (will be populated later with generated class IDs)
		$settings['classes'] = [
			'$$type' => 'classes',
			'value' => [],
		];
		
		// Add filtered attributes if present
		if ( ! empty( $attributes ) ) {
			$filtered_attributes = $this->filter_attributes( $attributes );
			if ( ! empty( $filtered_attributes ) ) {
				$settings['attributes'] = $filtered_attributes;
			}
		}
		
		return $settings;
	}

	private function add_content_settings( array $settings, string $widget_type, string $content, array $attributes ): array {
		switch ( $widget_type ) {
			case 'e-heading':
				$settings['title'] = $content;
				$settings['tag'] = $this->create_atomic_prop( 'string', $this->extract_heading_tag( $attributes ) );
				$settings['level'] = $this->extract_heading_level( $attributes );
				break;
				
			case 'e-paragraph':
				$settings['text'] = $content;
				break;
				
			case 'e-button':
				$settings['text'] = $content;
				if ( isset( $attributes['href'] ) ) {
					$settings['link'] = $this->create_link_prop( $attributes['href'], $attributes );
				}
				break;
				
			case 'e-image':
				$settings['src'] = $this->create_image_src_prop( $attributes['src'] ?? '' );
				$settings['alt'] = $attributes['alt'] ?? '';
				if ( isset( $attributes['width'] ) ) {
					$settings['width'] = $this->create_atomic_prop( 'string', $attributes['width'] );
				}
				if ( isset( $attributes['height'] ) ) {
					$settings['height'] = $this->create_atomic_prop( 'string', $attributes['height'] );
				}
				break;
				
			case 'e-flexbox':
				// Content for flexbox is handled by children
				break;
		}
		
		return $settings;
	}

	private function add_default_settings( array $settings, string $widget_type ): array {
		switch ( $widget_type ) {
			case 'e-flexbox':
				$default_flexbox = $this->widget_mapper->get_default_flexbox_settings();
				foreach ( $default_flexbox as $key => $value ) {
					if ( ! isset( $settings[ $key ] ) ) {
						$settings[ $key ] = $value;
					}
				}
				break;
		}
		
		return $settings;
	}

	private function create_atomic_prop( string $type, $value ): array {
		return [
			'$$type' => $type,
			'value' => $value,
		];
	}

	private function create_link_prop( string $url, array $attributes ): array {
		return [
			'$$type' => 'link',
			'value' => [
				'url' => $url,
				'is_external' => $this->is_external_url( $url ),
				'nofollow' => isset( $attributes['rel'] ) && strpos( $attributes['rel'], 'nofollow' ) !== false,
				'custom_attributes' => $this->extract_custom_link_attributes( $attributes ),
			],
		];
	}

	private function create_image_src_prop( string $src ): array {
		return [
			'$$type' => 'image-src',
			'value' => [
				'url' => $src,
				'id' => $this->extract_attachment_id_from_src( $src ),
			],
		];
	}

	private function extract_heading_tag( array $attributes ): string {
		// Extract from original tag or default to h1
		return $attributes['original_tag'] ?? 'h1';
	}

	private function extract_heading_level( array $attributes ): int {
		$tag = $this->extract_heading_tag( $attributes );
		return $this->widget_mapper->get_heading_level_from_tag( $tag );
	}

	private function filter_attributes( array $attributes ): array {
		$filtered = [];
		$excluded_attributes = ['style', 'class', 'id', 'href', 'src', 'alt', 'width', 'height', 'original_tag'];
		
		foreach ( $attributes as $name => $value ) {
			if ( ! in_array( $name, $excluded_attributes, true ) ) {
				$filtered[ $name ] = $value;
			}
		}
		
		return $filtered;
	}

	private function is_external_url( string $url ): bool {
		if ( empty( $url ) ) {
			return false;
		}
		
		// Check if it's a relative URL
		if ( strpos( $url, '/' ) === 0 || strpos( $url, '#' ) === 0 ) {
			return false;
		}
		
		// Check if it's the same domain
		$site_url = get_site_url();
		if ( $site_url && strpos( $url, $site_url ) === 0 ) {
			return false;
		}
		
		// Check if it starts with http/https
		return strpos( $url, 'http://' ) === 0 || strpos( $url, 'https://' ) === 0;
	}

	private function extract_custom_link_attributes( array $attributes ): string {
		$custom_attrs = [];
		$standard_attrs = ['href', 'target', 'rel', 'title', 'class', 'id', 'style'];
		
		foreach ( $attributes as $name => $value ) {
			if ( ! in_array( $name, $standard_attrs, true ) ) {
				$custom_attrs[] = $name . '="' . esc_attr( $value ) . '"';
			}
		}
		
		return implode( ' ', $custom_attrs );
	}

	private function extract_attachment_id_from_src( string $src ): ?int {
		if ( empty( $src ) ) {
			return null;
		}
		
		// Try to get attachment ID from WordPress if this is a local image
		if ( function_exists( 'attachment_url_to_postid' ) ) {
			$attachment_id = attachment_url_to_postid( $src );
			return $attachment_id > 0 ? $attachment_id : null;
		}
		
		return null;
	}
}

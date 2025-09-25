<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_Tag_To_Widget_Mapper {
	
	private array $tag_to_widget_map = [
		'h1' => 'e-heading',
		'h2' => 'e-heading',
		'h3' => 'e-heading',
		'h4' => 'e-heading',
		'h5' => 'e-heading',
		'h6' => 'e-heading',
		'p' => 'e-paragraph',
		'blockquote' => 'e-paragraph',
		'div' => 'e-flexbox',
		'section' => 'e-flexbox',
		'article' => 'e-flexbox',
		'aside' => 'e-flexbox',
		'header' => 'e-flexbox',
		'footer' => 'e-flexbox',
		'main' => 'e-flexbox',
		'nav' => 'e-flexbox',
		'span' => 'e-flexbox',
		'a' => 'e-button',
		'button' => 'e-button',
		'img' => 'e-image',
	];
	
	private array $default_flexbox_settings = [
		'direction' => 'column',
		'wrap' => 'nowrap',
		'justify_content' => 'flex-start',
		'align_items' => 'stretch',
		'gap' => [
			'column' => '0',
			'row' => '0',
		],
	];
	
	public function get_widget_type( string $tag ): string {
		$tag = strtolower( trim( $tag ) );
		
		return $this->tag_to_widget_map[ $tag ] ?? 'e-flexbox';
	}
	
	public function supports_tag( string $tag ): bool {
		$tag = strtolower( trim( $tag ) );
		
		return array_key_exists( $tag, $this->tag_to_widget_map );
	}
	
	public function get_supported_tags(): array {
		return array_keys( $this->tag_to_widget_map );
	}
	
	public function get_widget_specific_settings( string $tag, array $element_data ): array {
		$widget_type = $this->get_widget_type( $tag );
		
		switch ( $widget_type ) {
			case 'e-heading':
				return $this->get_heading_settings( $tag, $element_data );
				
			case 'e-paragraph':
				return $this->get_paragraph_settings( $tag, $element_data );
				
			case 'e-button':
				return $this->get_button_settings( $tag, $element_data );
				
			case 'e-image':
				return $this->get_image_settings( $tag, $element_data );
				
			case 'e-flexbox':
				return $this->get_flexbox_settings( $tag, $element_data );
				
			default:
				return [];
		}
	}
	
	private function get_heading_settings( string $tag, array $element_data ): array {
		$level = $this->extract_heading_level( $tag );
		
		return [
			'level' => $level,
			'text' => $element_data['text'] ?? '',
		];
	}
	
	private function extract_heading_level( string $tag ): int {
		$level_map = [
			'h1' => 1,
			'h2' => 2,
			'h3' => 3,
			'h4' => 4,
			'h5' => 5,
			'h6' => 6,
		];
		
		return $level_map[ $tag ] ?? 2;
	}
	
	private function get_paragraph_settings( string $tag, array $element_data ): array {
		return [
			'text' => $element_data['text'] ?? '',
		];
	}
	
	private function get_button_settings( string $tag, array $element_data ): array {
		$settings = [
			'text' => $element_data['text'] ?? 'Button',
		];
		
		if ( $tag === 'a' && ! empty( $element_data['attributes']['href'] ) ) {
			$settings['link'] = [
				'destination' => $element_data['attributes']['href'],
				'target' => $element_data['attributes']['target'] ?? '_self',
			];
		}
		
		return $settings;
	}
	
	private function get_image_settings( string $tag, array $element_data ): array {
		return [
			'src' => $element_data['attributes']['src'] ?? '',
			'alt' => $element_data['attributes']['alt'] ?? '',
		];
	}
	
	private function get_flexbox_settings( string $tag, array $element_data ): array {
		$settings = $this->default_flexbox_settings;
		
		$inline_styles = $element_data['inline_styles'] ?? [];
		
		if ( isset( $inline_styles['display'] ) && $inline_styles['display'] === 'flex' ) {
			$settings = array_merge( $settings, $this->extract_flexbox_properties( $inline_styles ) );
		}
		
		return $settings;
	}
	
	private function extract_flexbox_properties( array $inline_styles ): array {
		$flexbox_props = [];
		
		if ( isset( $inline_styles['flex-direction'] ) ) {
			$flexbox_props['direction'] = $inline_styles['flex-direction'];
		}
		
		if ( isset( $inline_styles['flex-wrap'] ) ) {
			$flexbox_props['wrap'] = $inline_styles['flex-wrap'];
		}
		
		if ( isset( $inline_styles['justify-content'] ) ) {
			$flexbox_props['justify_content'] = $inline_styles['justify-content'];
		}
		
		if ( isset( $inline_styles['align-items'] ) ) {
			$flexbox_props['align_items'] = $inline_styles['align-items'];
		}
		
		if ( isset( $inline_styles['gap'] ) ) {
			$gap_value = $inline_styles['gap'];
			$flexbox_props['gap'] = [
				'column' => $gap_value,
				'row' => $gap_value,
			];
		}
		
		return $flexbox_props;
	}
	
	public function is_container_element( string $tag ): bool {
		$container_tags = [ 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'span' ];
		
		return in_array( strtolower( $tag ), $container_tags, true );
	}
	
	public function is_text_element( string $tag ): bool {
		$text_tags = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote' ];
		
		return in_array( strtolower( $tag ), $text_tags, true );
	}
	
	public function is_interactive_element( string $tag ): bool {
		$interactive_tags = [ 'a', 'button' ];
		
		return in_array( strtolower( $tag ), $interactive_tags, true );
	}
}

<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class HTML_To_Atomic_Widget_Mapper {

	private array $widget_mapping = [
		// Text Elements
		'h1' => ['type' => 'e-heading', 'level' => 1],
		'h2' => ['type' => 'e-heading', 'level' => 2],
		'h3' => ['type' => 'e-heading', 'level' => 3],
		'h4' => ['type' => 'e-heading', 'level' => 4],
		'h5' => ['type' => 'e-heading', 'level' => 5],
		'h6' => ['type' => 'e-heading', 'level' => 6],
		'p' => ['type' => 'e-paragraph'],
		'blockquote' => ['type' => 'e-paragraph'],
		
		// Interactive Elements
		'button' => ['type' => 'e-button'],
		'a' => ['type' => 'e-button'], // Link buttons
		
		// Media Elements
		'img' => ['type' => 'e-image'],
		
		// Container Elements
		'div' => ['type' => 'e-flexbox'],
		'section' => ['type' => 'e-flexbox'],
		'article' => ['type' => 'e-flexbox'],
		'header' => ['type' => 'e-flexbox'],
		'footer' => ['type' => 'e-flexbox'],
		'main' => ['type' => 'e-flexbox'],
		'aside' => ['type' => 'e-flexbox'],
		'span' => ['type' => 'e-flexbox'],
		'nav' => ['type' => 'e-flexbox'],
	];

	public function get_widget_config( string $html_tag ): ?array {
		return $this->widget_mapping[ $html_tag ] ?? null;
	}

	public function is_container_widget( string $widget_type ): bool {
		return $widget_type === 'e-flexbox';
	}

	public function is_supported_tag( string $html_tag ): bool {
		return isset( $this->widget_mapping[ $html_tag ] );
	}

	public function get_supported_tags(): array {
		return array_keys( $this->widget_mapping );
	}

	public function get_widget_types(): array {
		$widget_types = [];
		
		foreach ( $this->widget_mapping as $config ) {
			$widget_types[] = $config['type'];
		}

		return array_unique( $widget_types );
	}

	public function get_tags_for_widget_type( string $widget_type ): array {
		$tags = [];

		foreach ( $this->widget_mapping as $tag => $config ) {
			if ( $config['type'] === $widget_type ) {
				$tags[] = $tag;
			}
		}

		return $tags;
	}

	public function get_heading_level_from_tag( string $tag ): int {
		$config = $this->get_widget_config( $tag );
		return $config['level'] ?? 1;
	}

	public function should_extract_href( string $tag ): bool {
		return $tag === 'a';
	}

	public function should_extract_src( string $tag ): bool {
		return $tag === 'img';
	}

	public function get_default_flexbox_settings(): array {
		return [
			'direction' => 'column',
			'wrap' => 'nowrap',
			'justify_content' => 'flex-start',
			'align_items' => 'stretch',
			'gap' => ['column' => '0', 'row' => '0'],
		];
	}
}

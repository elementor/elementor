<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Has_Base_Styles {
	public function get_base_styles() {
		if ( $this->should_disable_base_styles() ) {
			return [];
		}

		$base_styles = $this->define_base_styles();
		$style_definitions = [];

		foreach ( $base_styles as $key => $style ) {
			$id = $this->generate_base_style_id( $key );
			$style_definitions[ $id ] = $style->build( $id );
		}

		return $style_definitions;
	}

	private function should_disable_base_styles(): bool {
		return isset( $this->editor_settings['disable_base_styles'] ) && $this->editor_settings['disable_base_styles'];
	}

	public function get_base_styles_dictionary() {
		if ( $this->is_css_converter_widget() ) {
			return [];
		}
		
		$result = [];
		$base_styles = array_keys( $this->define_base_styles() );

		foreach ( $base_styles as $key ) {
			$base_class_id = $this->generate_base_style_id( $key );
			$result[ $key ] = $base_class_id;
		}

		return $result;
	}

	private function generate_base_style_id( string $key ): string {
		return static::get_element_type() . '-' . $key;
	}

	private function is_css_converter_widget(): bool {
		if ( ! empty( $this->editor_settings['disable_base_styles'] ) ) {
			return true;
		}

		if ( ! empty( $this->editor_settings['css_converter_widget'] ) ) {
			return true;
		}

		try {
			$settings = $this->get_atomic_settings();
			$classes = $settings['classes'] ?? [];

			if ( is_array( $classes ) ) {
				foreach ( $classes as $class ) {
					if ( is_string( $class ) && preg_match( '/^e-[a-f0-9]{7}-[a-f0-9]{7}$/', $class ) ) {
						return true;
					}
				}
			}

			if ( $this->version === '0.0' && ! empty( $settings['classes'] ) ) {
				return true;
			}
		} catch ( \Throwable $e ) {
		}

		return false;
	}

	protected function define_base_styles(): array {
		return [];
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Base_Styles {
	public function get_base_styles() {
		if ( $this->is_css_converter_widget() ) {
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

	public function get_base_styles_dictionary() {
		if ( $this->is_css_converter_widget() ) {
			return [];
		}

		$result = [];

		$base_styles = array_keys( $this->define_base_styles() );

		foreach ( $base_styles as $key ) {
			$result[ $key ] = $this->generate_base_style_id( $key );
		}

		return $result;
	}

	private function generate_base_style_id( string $key ): string {
		return static::get_element_type() . '-' . $key;
	}

	private function is_css_converter_widget(): bool {
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

	/**
	 * @return array<string, Style_Definition>
	 */
	protected function define_base_styles(): array {
		return [];
	}
}

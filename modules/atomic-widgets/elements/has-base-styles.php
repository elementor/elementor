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
		error_log( "🔥🔥🔥 ELEMENTOR_CSS: get_base_styles called for " . static::get_element_type() );
		error_log( "🔥🔥🔥 ELEMENTOR_CSS: editor_settings = " . json_encode( $this->editor_settings ?? [] ) );
		
		if ( $this->should_disable_base_styles() ) {
			error_log( "🔥🔥🔥 ELEMENTOR_CSS: Base styles DISABLED - returning empty array" );
			return [];
		}

		$base_styles = $this->define_base_styles();
		$style_definitions = [];

		foreach ( $base_styles as $key => $style ) {
			$id = $this->generate_base_style_id( $key );

			$style_definitions[ $id ] = $style->build( $id );
		}

		error_log( "🔥🔥🔥 ELEMENTOR_CSS: Returning " . count( $style_definitions ) . " base styles" );
		return $style_definitions;
	}

	private function should_disable_base_styles(): bool {
		$disable = isset( $this->editor_settings['disable_base_styles'] ) && $this->editor_settings['disable_base_styles'];
		error_log( "🔥🔥🔥 ELEMENTOR_CSS: should_disable_base_styles = " . ( $disable ? 'TRUE' : 'FALSE' ) );
		return $disable;
	}

	public function get_base_styles_dictionary() {
		error_log( "🔥🔥🔥 ELEMENTOR_CSS: get_base_styles_dictionary called for " . static::get_element_type() );
		error_log( "🔥🔥🔥 ELEMENTOR_CSS: editor_settings = " . json_encode( $this->editor_settings ?? [] ) );
		
		if ( $this->should_disable_base_styles() ) {
			error_log( "🔥🔥🔥 ELEMENTOR_CSS: Base styles dictionary DISABLED - returning empty array" );
			return [];
		}
		
		$result = [];

		$base_styles = array_keys( $this->define_base_styles() );

		foreach ( $base_styles as $key ) {
			$result[ $key ] = $this->generate_base_style_id( $key );
		}

		error_log( "🔥🔥🔥 ELEMENTOR_CSS: Returning " . count( $result ) . " base style class names" );
		return $result;
	}

	private function generate_base_style_id( string $key ): string {
		return static::get_element_type() . '-' . $key;
	}

	/**
	 * @return array<string, Style_Definition>
	 */
	protected function define_base_styles(): array {
		return [];
	}
}

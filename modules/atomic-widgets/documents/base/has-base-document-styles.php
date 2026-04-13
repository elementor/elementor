<?php

namespace Elementor\Modules\AtomicWidgets\Documents\Base;

use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Provides base style infrastructure for atomic documents.
 * Mirrors Has_Base_Styles (for widgets) but scopes IDs to document type via get_type().
 *
 * @mixin \Elementor\Core\Base\Document
 */
trait Has_Base_Document_Styles {

	/**
	 * Define base styles for this document type.
	 *
	 * @return array<string, Style_Definition>
	 */
	protected function define_base_styles(): array {
		return [];
	}

	/**
	 * Returns built style definitions keyed by generated style ID.
	 *
	 * @return array<string, array>
	 */
	public function get_base_styles(): array {
		$base_styles       = $this->define_base_styles();
		$style_definitions = [];

		foreach ( $base_styles as $key => $style ) {
			$id                      = $this->generate_base_style_id( $key );
			$style_definitions[ $id ] = $style->build( $id );
		}

		return $style_definitions;
	}

	/**
	 * Returns a mapping of style key → generated style ID.
	 *
	 * @return array<string, string>
	 */
	public function get_base_styles_dictionary(): array {
		$result = [];

		foreach ( array_keys( $this->define_base_styles() ) as $key ) {
			$result[ $key ] = $this->generate_base_style_id( $key );
		}

		return $result;
	}

	/**
	 * Generates a stable style ID scoped to this document type.
	 * Uses static::get_type() (e.g. 'header-v4') instead of get_element_type().
	 */
	private function generate_base_style_id( string $key ): string {
		return 'e-document-' . static::get_type() . '-' . $key;
	}
}

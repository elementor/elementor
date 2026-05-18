<?php
namespace Elementor\Modules\DesignMd\TokenBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Builder {

	const ROUNDED_MD_REFERENCE = '{rounded.md}';

	private array $typography_tokens;

	public function __construct( array $typography_tokens = [] ) {
		$this->typography_tokens = $typography_tokens;
	}

	public function build_body( array $settings ): array {
		$component = $this->build_text_component( $settings, 'body_color', 'body_typography' );

		$paragraph_spacing = Kit_Settings_Reader::dimension_to_string( $settings, 'paragraph_spacing' );
		if ( $paragraph_spacing ) {
			$component['paragraphSpacing'] = $paragraph_spacing;
		}

		return $component;
	}

	public function build_link( array $settings ): array {
		return $this->build_text_component( $settings, 'link_normal_color', 'link_normal_typography' );
	}

	public function build_link_hover( array $settings ): array {
		return $this->build_text_component( $settings, 'link_hover_color', 'link_hover_typography' );
	}

	public function build_heading( array $settings, string $level ): array {
		return $this->build_text_component( $settings, $level . '_color', $level . '_typography' );
	}

	public function build_text_component( array $settings, string $color_key, string $typography_key ): array {
		$component = [];

		$text_color = Kit_Settings_Reader::resolve_color( $settings, $color_key );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$component = array_merge( $component, $this->resolve_typography_props( $settings, $typography_key ) );

		return $component;
	}

	public function build_button( array $settings ): array {
		$component = [];

		$bg_color = Kit_Settings_Reader::resolve_color( $settings, 'button_background_color' );
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = Kit_Settings_Reader::resolve_color( $settings, 'button_text_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$radius = Kit_Settings_Reader::dimension_to_string( $settings, 'button_border_radius', 'top' );
		if ( $radius ) {
			$component['rounded'] = self::ROUNDED_MD_REFERENCE;
		}

		$padding = Kit_Settings_Reader::dimension_to_string( $settings, 'button_padding', 'top' );
		if ( $padding ) {
			$component['padding'] = $padding;
		}

		$component = array_merge( $component, $this->resolve_typography_props( $settings, 'button_typography' ) );
		$component = array_merge( $component, $this->extract_border_props( $settings, 'button' ) );

		return $component;
	}

	public function build_button_hover( array $settings ): array {
		$component = [];

		$bg_color = Kit_Settings_Reader::resolve_color( $settings, 'button_hover_background_color' );
		if ( $bg_color ) {
			$component['backgroundColor'] = $bg_color;
		}

		$text_color = Kit_Settings_Reader::resolve_color( $settings, 'button_hover_text_color' );
		if ( $text_color ) {
			$component['textColor'] = $text_color;
		}

		$radius = Kit_Settings_Reader::dimension_to_string( $settings, 'button_hover_border_radius', 'top' );
		if ( $radius ) {
			$component['rounded'] = self::ROUNDED_MD_REFERENCE;
		}

		$component = array_merge( $component, $this->extract_border_props( $settings, 'button_hover' ) );

		return $component;
	}

	private function resolve_typography_props( array $settings, string $typography_key ): array {
		$typo_ref = Kit_Settings_Reader::resolve_typography_reference( $settings, $typography_key );

		if ( $typo_ref ) {
			$token_id  = $this->extract_token_id_from_typography_ref( $typo_ref );
			$per_props = $this->build_per_prop_references_for_token( $token_id );

			if ( $per_props ) {
				return $per_props;
			}

			$inline_props = Kit_Settings_Reader::extract_typography_props( $settings, $typography_key . '_' );

			return $inline_props ? $inline_props : [ 'typography' => $typo_ref ];
		}

		$inline_props = Kit_Settings_Reader::extract_typography_props( $settings, $typography_key . '_' );
		$matched_id   = $this->find_matching_typography_id( $inline_props );

		if ( $matched_id ) {
			return $this->build_per_prop_references_for_token( $matched_id );
		}

		return $inline_props;
	}

	private function extract_token_id_from_typography_ref( string $typo_ref ): string {
		if ( preg_match( '/^\{typography\.(.+)\}$/', $typo_ref, $matches ) ) {
			return $matches[1];
		}

		return '';
	}

	private function build_per_prop_references_for_token( string $token_id ): array {
		$token_props = $this->typography_tokens[ $token_id ] ?? [];
		$refs        = [];

		foreach ( $token_props as $prop_name => $prop_value ) {
			$refs[ $prop_name ] = '{typography.' . $token_id . '.' . $prop_name . '}';
		}

		return $refs;
	}

	private function find_matching_typography_id( array $props ): string {
		if ( ! $props ) {
			return '';
		}

		foreach ( $this->typography_tokens as $id => $token_props ) {
			$sorted_props = $props;
			$sorted_token = $token_props;
			ksort( $sorted_props );
			ksort( $sorted_token );

			if ( $sorted_props === $sorted_token ) {
				return (string) $id;
			}
		}

		return '';
	}

	private function extract_border_props( array $settings, string $prefix ): array {
		$props = [];

		$border_type = $settings[ $prefix . '_border_border' ] ?? '';
		if ( $border_type ) {
			$props['borderType'] = $border_type;
		}

		$border_width = Kit_Settings_Reader::dimension_to_string( $settings, $prefix . '_border_width', 'top' );
		if ( $border_width ) {
			$props['borderWidth'] = $border_width;
		}

		$border_color = Kit_Settings_Reader::resolve_color( $settings, $prefix . '_border_color' );
		if ( $border_color ) {
			$props['borderColor'] = $border_color;
		}

		return $props;
	}
}

<?php

namespace Elementor\Modules\Components\Variants;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Component_Variant_Parser {
	const REQUIRED_FIELDS = [ 'id', 'label' ];
	const ACTION_ADD = 'add';
	const NESTED_VARIANT_KEY = 'variant';

	public static function make(): self {
		return new self();
	}

	public function parse( array $variant ): Parse_Result {
		$result = Parse_Result::make();

		foreach ( self::REQUIRED_FIELDS as $field ) {
			if ( ! isset( $variant[ $field ] ) || ! is_string( $variant[ $field ] ) || '' === $variant[ $field ] ) {
				$result->errors()->add( $field, 'missing_field' );
			}
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		$widgets_result = $this->parse_widgets( $variant['widgets'] ?? [] );

		if ( ! $widgets_result->is_valid() ) {
			$result->errors()->merge( $widgets_result->errors(), 'widgets' );

			return $result;
		}

		return $result->wrap( [
			'id' => sanitize_key( $variant['id'] ),
			'label' => sanitize_text_field( $variant['label'] ),
			'widgets' => $widgets_result->unwrap(),
		] );
	}

	private function parse_widgets( array $widgets ): Parse_Result {
		$result = Parse_Result::make();
		$sanitized = [];

		foreach ( $widgets as $element_id => $entry ) {
			if ( ! is_string( $element_id ) || '' === $element_id ) {
				$result->errors()->add( (string) $element_id, 'invalid_element_id' );
				continue;
			}

			if ( ! is_array( $entry ) ) {
				$result->errors()->add( $element_id, 'invalid_entry' );
				continue;
			}

			$entry_result = $this->parse_widget_entry( $entry );

			if ( ! $entry_result->is_valid() ) {
				$result->errors()->merge( $entry_result->errors(), $element_id );
				continue;
			}

			$sanitized[ sanitize_key( $element_id ) ] = $entry_result->unwrap();
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		return $result->wrap( $sanitized );
	}

	private function parse_widget_entry( array $entry ): Parse_Result {
		$result = Parse_Result::make();
		$sanitized = [];

		if ( isset( $entry['settings'] ) ) {
			$settings_result = $this->parse_settings( $entry['settings'] );

			if ( ! $settings_result->is_valid() ) {
				$result->errors()->merge( $settings_result->errors(), 'settings' );

				return $result;
			}

			$sanitized_settings = $settings_result->unwrap();

			if ( ! empty( $sanitized_settings ) ) {
				$sanitized['settings'] = $sanitized_settings;
			}
		}

		if ( isset( $entry[ self::NESTED_VARIANT_KEY ] ) ) {
			$nested = $entry[ self::NESTED_VARIANT_KEY ];

			if ( ! is_string( $nested ) || '' === $nested ) {
				$result->errors()->add( self::NESTED_VARIANT_KEY, 'invalid_variant_id' );

				return $result;
			}

			$sanitized[ self::NESTED_VARIANT_KEY ] = sanitize_key( $nested );
		}

		return $result->wrap( $sanitized );
	}

	private function parse_settings( array $settings ): Parse_Result {
		$result = Parse_Result::make();

		if ( isset( $settings[ self::NESTED_VARIANT_KEY ] ) ) {
			$result->errors()->add( self::NESTED_VARIANT_KEY, 'nested_variant_forbidden' );

			return $result;
		}

		$sanitized = [];

		if ( isset( $settings['classes'] ) ) {
			$classes_result = $this->parse_classes( $settings['classes'] );

			if ( ! $classes_result->is_valid() ) {
				$result->errors()->merge( $classes_result->errors(), 'classes' );

				return $result;
			}

			$sanitized_classes = $classes_result->unwrap();

			if ( ! empty( $sanitized_classes ) ) {
				$sanitized['classes'] = $sanitized_classes;
			}
		}

		return $result->wrap( $sanitized );
	}

	private function parse_classes( array $classes ): Parse_Result {
		$result = Parse_Result::make();

		if ( ! isset( $classes[ self::ACTION_ADD ] ) ) {
			return $result->wrap( [] );
		}

		$add_list = $classes[ self::ACTION_ADD ];

		if ( ! is_array( $add_list ) ) {
			$result->errors()->add( self::ACTION_ADD, 'invalid_structure' );

			return $result;
		}

		$transformable = [
			'$$type' => Classes_Prop_Type::get_key(),
			'value' => $add_list,
		];

		$classes_prop_type = Classes_Prop_Type::make();

		if ( ! $classes_prop_type->validate( $transformable ) ) {
			$result->errors()->add( self::ACTION_ADD, 'invalid_class_id' );

			return $result;
		}

		$sanitized = $classes_prop_type->sanitize( $transformable );

		return $result->wrap( [
			self::ACTION_ADD => array_values( $sanitized['value'] ),
		] );
	}
}

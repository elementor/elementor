<?php

namespace Elementor\Modules\Components\OverridableProps;

use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Overridable_Prop_Parser {
	public static function make(): self {
		return new static();
	}

	public function parse( array $prop ): Parse_Result {
		$validation_result = $this->validate( $prop );

		if ( ! $validation_result->is_valid() ) {
			return $validation_result;
		}

		return $this->sanitize( $prop );
	}

	private function validate( array $prop ): Parse_Result {
		$result = Parse_Result::make();

		$required_fields = [
			'overrideKey',
			'label',
			'elementId',
			'elType',
			'widgetType',
			'propKey',
			'groupId',
		];

		foreach ( $required_fields as $field ) {
			if ( ! isset( $prop[ $field ] ) ) {
				$result->errors()->add( $field, 'missing_field' );
			}
		}

		if ( ! $result->is_valid() ) {
			return $result;
		}

		$origin_value = $this->get_final_origin_value( $prop );

		if ( ! empty( $origin_value ) ) {
			$origin_value_prop_type = $this->get_origin_prop_type( $prop );

			if ( ! $origin_value_prop_type->validate( $origin_value ) ) {
				$result->errors()->add( 'originValue', 'invalid' );

				return $result;
			}
		}

		return $result;
	}

	private function sanitize( array $prop ): Parse_Result {
		$result = Parse_Result::make();

		$sanitized_origin_value = $this->get_sanitized_origin_value( $prop );

		$sanitized_prop = [
			'overrideKey' => sanitize_key( $prop['overrideKey'] ),
			'label' => sanitize_text_field( $prop['label'] ),
			'elementId' => sanitize_key( $prop['elementId'] ),
			'propKey' => sanitize_text_field( $prop['propKey'] ),
			'widgetType' => sanitize_text_field( $prop['widgetType'] ),
			'elType' => sanitize_text_field( $prop['elType'] ),
			'originValue' => $sanitized_origin_value,
			'groupId' => sanitize_key( $prop['groupId'] ),
			'originPropFields' => isset( $prop['originPropFields'] ) ? [
				'elType' => sanitize_text_field( $prop['originPropFields']['elType'] ),
				'widgetType' => sanitize_text_field( $prop['originPropFields']['widgetType'] ),
				'propKey' => sanitize_text_field( $prop['originPropFields']['propKey'] ),
				'elementId' => sanitize_key( $prop['originPropFields']['elementId'] ),
			] : null,
		];

		return $result->wrap( $sanitized_prop );
	}

	private function is_with_origin_prop_fields( array $prop ): bool {
		return ! empty( $prop['originPropFields'] );
	}

	private function get_origin_prop_type( array $prop ) {
		if ( $this->is_with_origin_prop_fields( $prop ) ) {
			return $this->get_origin_prop_type( $prop['originPropFields'] );
		}

		return Parsing_Utils::get_prop_type(
			$prop['elType'],
			$prop['widgetType'],
			$prop['propKey'],
		);
	}

	private function get_final_origin_value( array $prop ) {
		if ( empty( $prop ) || empty( $prop['originValue'] ) ) {
			return null;
		}

		if (
			isset( $prop['originValue']['$$type'] ) &&
			Override_Prop_Type::get_key() === $prop['originValue']['$$type']
		) {
			return $prop['originValue']['value']['override_value'];
		}

		return $prop['originValue'];
	}

	private function get_sanitized_origin_value( array $prop ) {
		$origin_value = $this->get_final_origin_value( $prop );
		$origin_prop_type = $this->get_origin_prop_type( $prop );

		if ( ! empty( $origin_value ) ) {
			$sanitized_value = $origin_prop_type->sanitize( $origin_value );

			if ( Override_Prop_Type::get_key() === $prop['originValue']['$$type'] ) {
				$raw_origin_value = $prop['originValue'];
				$raw_origin_value['value']['override_value'] = $sanitized_value;
				return $raw_origin_value;
			}

			return $sanitized_value;
		}

		return null;
	}
}

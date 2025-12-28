<?php

namespace Elementor\Modules\Components\OverridableProps;

use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Core\Utils\Api\Parse_Result;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Overridable_Prop_Parser {
	private $origin_value_prop_type;

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

		if ( isset( $prop['originPropFields'] ) ) {
			['elType' => $el_type, 'widgetType' => $widget_type, 'propKey' => $prop_key] = $prop['originPropFields'];
		} else {
			['elType' => $el_type, 'widgetType' => $widget_type, 'propKey' => $prop_key] = $prop;
		}		
		$this->origin_value_prop_type = Parsing_Utils::get_prop_type( $el_type, $widget_type, $prop_key );

		if ( ! empty( $prop['originValue'] ) && ! $this->origin_value_prop_type->validate( $prop['originValue'] ) ) {
			$result->errors()->add( 'originValue', 'invalid' );

			return $result;
		}

		return $result;
	}

	private function sanitize( array $prop ): Parse_Result {
		$result = Parse_Result::make();

		$sanitized_prop = [
			'overrideKey' => sanitize_key( $prop['overrideKey'] ),
			'label' => sanitize_text_field( $prop['label'] ),
			'elementId' => sanitize_key( $prop['elementId'] ),
			'propKey' => sanitize_text_field( $prop['propKey'] ),
			'widgetType' => sanitize_text_field( $prop['widgetType'] ),
			'elType' => sanitize_text_field( $prop['elType'] ),
			'originValue' => $this->origin_value_prop_type->sanitize( $prop['originValue'] ),
			'groupId' => sanitize_key( $prop['groupId'] ),
		];

		return $result->wrap( $sanitized_prop );
	}
}

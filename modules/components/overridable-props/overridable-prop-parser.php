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
			'overrideKey' => 'is_string',
			'label' => 'is_string',
			'elementId' => 'is_string',
			'elType' => 'is_string',
			'widgetType' => 'is_string',
			'path' => fn( $path ) => $this->validate_path( $path ),
			'groupId' => 'is_string',
		];

		foreach ( $required_fields as $field => $validator ) {
			if ( ! array_key_exists( $field, $prop ) ) {
				$result->errors()->add( $field, 'missing_field' );
				continue;
			}
			if ( ! call_user_func( $validator, $prop[ $field ] ) ) {
				$result->errors()->add( $field, 'invalid_value' );
			}
		}

		$this->origin_value_prop_type = Parsing_Utils::get_prop_type( $prop['elType'], $prop['widgetType'], $prop['path'] );

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
			'path' => array_map( fn ( $item ) => [
				'key' => sanitize_text_field( $item['key'] ),
				'$$type' => sanitize_text_field( $item['$$type'] ),
			], $prop['path'] ),
			'widgetType' => sanitize_text_field( $prop['widgetType'] ),
			'elType' => sanitize_text_field( $prop['elType'] ),
			'originValue' => $this->origin_value_prop_type->sanitize( $prop['originValue'] ),
			'groupId' => sanitize_key( $prop['groupId'] ),
		];

		return $result->wrap( $sanitized_prop );
	}

	private function validate_path( array $path ): bool {
		if ( ! is_array( $path ) ) {
			return false;
		}

		$is_valid = true;
		foreach ( $path as $item ) {
			if ( ! isset( $item['key'] ) || ! isset( $item['$$type'] ) || ! is_string( $item['key'] ) || ! is_string( $item['$$type'] ) ) {
				$is_valid = false;
				break;
			}
		}

		return $is_valid;
	}
}

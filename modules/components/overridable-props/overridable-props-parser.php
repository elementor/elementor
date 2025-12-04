<?php

namespace Elementor\Modules\Components\OverridableProps;

use Elementor\Core\Utils\Api\Parse_Result;
use Elementor\Modules\Components\Utils\Parsing_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Overridable_Props_Parser {
	private Overridable_Prop_Parser $prop_parser;

	public function __construct( Overridable_Prop_Parser $prop_parser ) {
		$this->prop_parser = $prop_parser;
	}

	public static function make(): self {
		return new static( Overridable_Prop_Parser::make() );
	}

	public function parse( array $props ): Parse_Result {
		$parse_props_result = $this->parse_props( $props );

		if ( ! $parse_props_result->is_valid() ) {
			return $parse_props_result;
		}

		$parsed_props = $parse_props_result->unwrap();

		$validation_result = $this->validate( $parsed_props );

		if ( ! $validation_result->is_valid() ) {
			return $validation_result;
		}

		return Parse_Result::make()->wrap( $parsed_props );
	}

	private function parse_props( array $props ): Parse_Result {
		$result = Parse_Result::make();
		$parsed_props = [];

		foreach ( $props as $prop_id => $prop ) {
			if ( ! is_array( $prop ) ) {
				$result->errors()->add( "props.$prop_id", 'invalid_structure' );

				continue;
			}

			$prop_result = $this->prop_parser->parse( $prop );

			if ( ! $prop_result->is_valid() ) {
				$result->errors()->merge( $prop_result->errors(), "props.$prop_id" );

				continue;
			}

			$parsed_prop = $prop_result->unwrap();
			$parsed_prop_id = sanitize_key( $prop_id );

			if ( $parsed_prop_id != $parsed_prop['overrideKey'] ) {
				$result->errors()->add( "props.$parsed_prop_id", 'mismatching_override_key' );

				continue;
			}

			$parsed_props[ $parsed_prop_id ] = $parsed_prop;
		}

		return $result->wrap( $parsed_props );
	}

	private function validate( array $props ): Parse_Result {
		$result = Parse_Result::make();

		$duplicate_prop_keys_for_same_element = Parsing_Utils::get_duplicates( array_map( fn( $prop ) => $prop['elementId'] . '.' . $prop['propKey'], $props ) );

		if ( ! empty( $duplicate_prop_keys_for_same_element ) ) {
			$result->errors()->add( 'props', 'duplicate_prop_keys_for_same_element: ' . implode( ', ', $duplicate_prop_keys_for_same_element ) );

			return $result;
		}

		return $result;
	}
}

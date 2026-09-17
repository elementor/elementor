<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for individual flex longhands (flex-grow, flex-basis) that contribute one field to
 * the aggregate `flex` prop. Reads the existing flex prop from context (if any), updates the
 * target field, then writes the merged result back.
 *
 * Value parsing is delegated to an injected callable so each instance can apply the correct
 * parser (numeric for flex-grow, size for flex-basis) without duplicating merge logic.
 */
class Flex_Longhand_Converter extends Property_Converter_Base {
	private string $property;
	private string $field_key;

	/** @var callable(string): ?array */
	private $value_parser;

	public function __construct( string $property, string $field_key, callable $value_parser ) {
		$this->property     = $property;
		$this->field_key    = $field_key;
		$this->value_parser = $value_parser;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		$fields                     = $this->current_flex_fields( $context->get_prop( 'flex' ) );
		$fields[ $this->field_key ] = null;

		$context->set_prop( 'flex', Flex_Prop_Type::generate( $fields ) );

		return true;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$parsed = ( $this->value_parser )( trim( $rule['value'] ) );

		if ( null === $parsed ) {
			return false;
		}

		$fields                     = $this->current_flex_fields( $context->get_prop( 'flex' ) );
		$fields[ $this->field_key ] = $parsed;

		$context->set_prop( 'flex', Flex_Prop_Type::generate( $fields ) );

		return true;
	}

	private function current_flex_fields( $existing ): array {
		if (
			is_array( $existing ) &&
			Flex_Prop_Type::get_key() === ( $existing['$$type'] ?? null ) &&
			is_array( $existing['value'] ?? null )
		) {
			return $existing['value'];
		}

		return [];
	}
}

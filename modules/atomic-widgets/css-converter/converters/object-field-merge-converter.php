<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for a single scalar longhand that contributes one field to a flat aggregate object prop,
 * e.g. background-color -> the `color` field of `background` (Background), background-clip -> `clip`.
 * One instance per input property.
 *
 * The target object is accumulated in the shared context across sibling declarations: each instance
 * reads the current target prop, re-populates it when it is already this object, or starts a fresh one
 * otherwise, then writes the single field it owns. Unlike Object_Side_Merge_Converter there is no
 * single-member seeding because the aggregate has no scalar union member.
 *
 * The leaf is produced by the injected leaf prop type's generate(). An optional allowlist rejects
 * out-of-enum values, and an optional single-token guard rejects multi-token values (a faithful single
 * color must be one paren-aware token). A rejected value declines the declaration (-> custom_css) and
 * leaves the accumulated object untouched.
 */
class Object_Field_Merge_Converter extends Property_Converter_Base {
	private string $property;
	private string $target_property;
	private string $type_key;
	private string $field_key;

	/**
	 * @var class-string
	 */
	private string $leaf_prop_type;

	/**
	 * @var class-string
	 */
	private string $object_prop_type;

	/**
	 * @var string[]|null
	 */
	private ?array $allowed_values;

	private bool $single_token_only;

	/**
	 * @param string        $property          The input longhand this converter owns (e.g. background-color).
	 * @param string        $target_property   The aggregate prop it contributes to (e.g. background).
	 * @param string        $type_key          The aggregate object's $$type (e.g. background).
	 * @param string        $field_key         The object field this longhand fills (e.g. color).
	 * @param string        $leaf_prop_type    Prop_Type class whose generate() wraps the leaf value.
	 * @param string        $object_prop_type  Object_Prop_Type class used to wrap the merged fields.
	 * @param string[]|null $allowed_values    Enum allowlist for the leaf, or null to accept any value.
	 * @param bool          $single_token_only Reject values that split into more than one top-level token.
	 */
	public function __construct(
		string $property,
		string $target_property,
		string $type_key,
		string $field_key,
		string $leaf_prop_type,
		string $object_prop_type,
		?array $allowed_values = null,
		bool $single_token_only = false
	) {
		$this->property = $property;
		$this->target_property = $target_property;
		$this->type_key = $type_key;
		$this->field_key = $field_key;
		$this->leaf_prop_type = $leaf_prop_type;
		$this->object_prop_type = $object_prop_type;
		$this->allowed_values = $allowed_values;
		$this->single_token_only = $single_token_only;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		$fields = $this->current_fields( $context->get_prop( $this->target_property ) );
		$fields[ $this->field_key ] = null;

		$context->set_prop( $this->target_property, ( $this->object_prop_type )::generate( $fields ) );

		return true;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( '' === $value ) {
			return false;
		}

		if ( null !== $this->allowed_values && ! in_array( $value, $this->allowed_values, true ) ) {
			return false;
		}

		if ( $this->single_token_only && 1 !== count( Css_Token_Splitter::split_by_whitespace( $value ) ) ) {
			return false;
		}

		$fields = $this->current_fields( $context->get_prop( $this->target_property ) );
		$fields[ $this->field_key ] = ( $this->leaf_prop_type )::generate( $value );

		$context->set_prop( $this->target_property, ( $this->object_prop_type )::generate( $fields ) );

		return true;
	}

	/**
	 * @param mixed $existing The current target prop value, if any.
	 * @return array<string, array> Field key -> leaf PropValue.
	 */
	private function current_fields( $existing ): array {
		if ( ! is_array( $existing ) ) {
			return [];
		}

		$type = $existing['$$type'] ?? null;

		if ( $this->type_key === $type && is_array( $existing['value'] ?? null ) ) {
			return $existing['value'];
		}

		return [];
	}
}

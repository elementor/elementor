<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Var_Token_Resolver;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for a single side/corner longhand that contributes a fragment to a multi-side object prop:
 * border-{side}-width -> a side of `border-width` (Border_Width), border-{corner}-radius -> a corner of
 * `border-radius` (Border_Radius). One instance per input property.
 *
 * The target object is accumulated in the shared context across sibling declarations: each instance
 * reads the current target prop and re-populates it. If the target is already this object it merges the
 * one side in; if it is the single Size member (e.g. a prior `border-width: 1px`) all sides are seeded
 * from that single before the override, so the CSS cascade stays faithful; otherwise a fresh object is
 * created. A value the Size parser rejects declines the declaration (-> custom_css) and leaves the
 * accumulated object untouched.
 */
class Object_Side_Merge_Converter extends Property_Converter_Base {
	const SIZE_TYPE = 'size';

	private string $property;
	private string $target_property;
	private string $type_key;
	private string $side_key;

	/**
	 * @var string[]
	 */
	private array $all_side_keys;

	/**
	 * @var class-string
	 */
	private string $object_prop_type;

	private ?Variables_Service $variables_service;

	/**
	 * @param string                 $property         The input longhand this converter owns (e.g. border-top-width).
	 * @param string                 $target_property  The aggregate prop it contributes to (e.g. border-width).
	 * @param string                 $type_key         The aggregate object's $$type (e.g. border-width).
	 * @param string                 $side_key         The object key this longhand fills (e.g. block-start).
	 * @param string[]               $all_side_keys    Every key of the object, used to seed from a single Size.
	 * @param string                 $object_prop_type Object_Prop_Type class used to wrap the merged sides.
	 * @param Variables_Service|null $variables_service When provided, a var-only value that resolves to a
	 *                                                  known size variable is emitted as a variable PropValue
	 *                                                  instead of a raw Size leaf.
	 */
	public function __construct(
		string $property,
		string $target_property,
		string $type_key,
		string $side_key,
		array $all_side_keys,
		string $object_prop_type,
		?Variables_Service $variables_service = null
	) {
		$this->property = $property;
		$this->target_property = $target_property;
		$this->type_key = $type_key;
		$this->side_key = $side_key;
		$this->all_side_keys = $all_side_keys;
		$this->object_prop_type = $object_prop_type;
		$this->variables_service = $variables_service;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		$sides = $this->current_sides( $context->get_prop( $this->target_property ) );
		$sides[ $this->side_key ] = null;

		$context->set_prop( $this->target_property, ( $this->object_prop_type )::generate( $sides ) );

		return true;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );
		$leaf  = Size_Plain_Resolver::parse( $value );

		if ( null === $leaf ) {
			return false;
		}

		$side_value = Css_Var_Token_Resolver::resolve_size_var_prop_value( $this->variables_service, $value )
			?? Size_Prop_Type::generate( $leaf );

		$sides = $this->current_sides( $context->get_prop( $this->target_property ) );
		$sides[ $this->side_key ] = $side_value;

		$context->set_prop( $this->target_property, ( $this->object_prop_type )::generate( $sides ) );

		return true;
	}

	/**
	 * @param mixed $existing The current target prop value, if any.
	 * @return array<string, array> Side key -> Size PropValue.
	 */
	private function current_sides( $existing ): array {
		if ( ! is_array( $existing ) ) {
			return [];
		}

		$type = $existing['$$type'] ?? null;

		if ( $this->type_key === $type && is_array( $existing['value'] ?? null ) ) {
			return $existing['value'];
		}

		if ( self::SIZE_TYPE === $type ) {
			return array_fill_keys( $this->all_side_keys, $existing );
		}

		return [];
	}
}

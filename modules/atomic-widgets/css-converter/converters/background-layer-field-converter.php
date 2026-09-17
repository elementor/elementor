<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Image_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for scalar sub-layer longhands of `background-image`: background-repeat,
 * background-attachment, background-size, background-position. One instance per CSS property.
 *
 * Reads the ordered list of `background-image-overlay` items currently in the `background` context
 * object. If no image layers exist yet the declaration is declined (-> custom_css) because there is
 * nothing to attach the value to. CSS comma-separated lists are correlated to layers by position: a
 * single value applies to all layers; multiple values are distributed 1:1. A mismatch in count
 * declines the declaration.
 *
 * Each per-layer token is validated first against an optional string enum (e.g. repeat, cover).
 * When a token is not in the enum and a pair prop type is configured, the token is re-parsed as two
 * whitespace-separated Size values (e.g. `50% 50%` for size, `10px 20px` for position offset).
 * Any token that fails both checks declines the whole declaration.
 */
class Background_Layer_Field_Converter extends Property_Converter_Base {
	private string $property;
	private string $field_key;

	/**
	 * @var string[]|null
	 */
	private ?array $allowed_values;

	/**
	 * @var class-string|null
	 */
	private ?string $pair_prop_type;

	/**
	 * @var string[]
	 */
	private array $pair_keys;

	/**
	 * @param string        $property        The CSS longhand property this converter owns.
	 * @param string        $field_key       The field key inside each background-image-overlay value.
	 * @param string[]|null $allowed_values  String enum allowlist, or null to skip enum check.
	 * @param string|null   $pair_prop_type  Object_Prop_Type class for size-pair values, or null.
	 * @param string[]      $pair_keys       The two field keys of the pair type (e.g. ['x','y']).
	 */
	public function __construct(
		string $property,
		string $field_key,
		?array $allowed_values,
		?string $pair_prop_type = null,
		array $pair_keys = []
	) {
		$this->property = $property;
		$this->field_key = $field_key;
		$this->allowed_values = $allowed_values;
		$this->pair_prop_type = $pair_prop_type;
		$this->pair_keys = $pair_keys;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		return true;
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$overlay_items = $this->get_overlay_items( $context );
		$image_indices = array_keys(
			array_filter( $overlay_items, fn( $item ) => Background_Image_Overlay_Prop_Type::get_key() === ( $item['$$type'] ?? null ) )
		);

		if ( empty( $image_indices ) ) {
			return false;
		}

		$tokens = Css_Token_Splitter::split_by_comma( trim( $rule['value'] ) );
		$prop_values = [];

		foreach ( $tokens as $token ) {
			$leaf = $this->parse_token( $token );

			if ( null === $leaf ) {
				return false;
			}

			$prop_values[] = $leaf;
		}

		$layer_count = count( $image_indices );
		$value_count = count( $prop_values );

		if ( 1 !== $value_count && $layer_count !== $value_count ) {
			return false;
		}

		foreach ( $image_indices as $order => $index ) {
			$value_index = 1 === $value_count ? 0 : $order;
			$overlay_items[ $index ]['value'][ $this->field_key ] = $prop_values[ $value_index ];
		}

		$background = $context->get_prop( 'background' );
		$fields = is_array( $background ) && isset( $background['value'] ) ? $background['value'] : [];
		$fields['background-overlay'] = Background_Overlay_Prop_Type::generate( array_values( $overlay_items ) );

		$context->set_prop( 'background', Background_Prop_Type::generate( $fields ) );

		return true;
	}

	private function get_overlay_items( Conversion_Context $context ): array {
		$background = $context->get_prop( 'background' );

		if ( ! is_array( $background ) ) {
			return [];
		}

		$overlay = $background['value']['background-overlay'] ?? null;

		if ( ! is_array( $overlay ) ) {
			return [];
		}

		return $overlay['value'] ?? [];
	}

	protected function parse_token( string $token ): ?array {
		$token = trim( $token );

		if ( null !== $this->allowed_values && in_array( $token, $this->allowed_values, true ) ) {
			return String_Prop_Type::generate( $token );
		}

		if ( null !== $this->pair_prop_type ) {
			return $this->parse_size_pair( $token );
		}

		return null;
	}

	private function parse_size_pair( string $token ): ?array {
		$parts = Css_Token_Splitter::split_by_whitespace( $token );

		if ( 2 !== count( $parts ) ) {
			return null;
		}

		$first = Size_Value_Parser::parse( $parts[0] );
		$second = Size_Value_Parser::parse( $parts[1] );

		if ( null === $first || null === $second ) {
			return null;
		}

		return ( $this->pair_prop_type )::generate( [
			$this->pair_keys[0] => Size_Prop_Type::generate( $first ),
			$this->pair_keys[1] => Size_Prop_Type::generate( $second ),
		] );
	}
}

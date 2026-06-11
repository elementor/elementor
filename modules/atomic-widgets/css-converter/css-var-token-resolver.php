<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Utils\Variable_Type_Keys;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Css_Var_Token_Resolver {
	public static function is_var_only_token( string $token ): bool {
		$token = trim( $token );

		if ( null === Css_Var_Reference::parse( $token ) ) {
			return false;
		}

		return 1 === count( Css_Token_Splitter::split_by_whitespace( $token ) );
	}

	public static function resolve_var_only_token_type( ?Variables_Service $service, string $token ): ?string {
		if ( ! self::is_var_only_token( $token ) || null === $service ) {
			return null;
		}

		$reference = Css_Var_Reference::parse( trim( $token ) );

		if ( null === $reference ) {
			return null;
		}

		$variable = $service->find_by_label_or_id( $reference );

		if ( null === $variable ) {
			return null;
		}

		return Variable_Type_Keys::get_resolved_type( $variable['type'] ?? '' );
	}

	/**
	 * If $token is a var-only token that resolves to a known size variable, returns the ready-made
	 * size-variable PropValue `['$$type' => ..., 'value' => $id]`. Returns null if the token is not
	 * a var, the variable is unknown, or the variable type is not a size (caller should then fall
	 * back to the raw Size leaf or decline to customCss based on context).
	 *
	 * @return array{$$type: string, value: string}|null
	 */
	public static function resolve_size_var_prop_value( ?Variables_Service $service, string $token ): ?array {
		if ( 'size' !== self::resolve_var_only_token_type( $service, $token ) ) {
			return null;
		}

		$reference = Css_Var_Reference::parse( trim( $token ) );
		$variable   = $service->find_by_label_or_id( $reference );
		$id         = $variable['id'] ?? '';

		if ( '' === $id ) {
			return null;
		}

		$prop_type_key = Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY === ( $variable['type'] ?? '' )
			? Size_Variable_Prop_Type::get_key()
			: ( $variable['type'] ?? '' );

		return [
			'$$type' => $prop_type_key,
			'value' => $id,
		];
	}
}

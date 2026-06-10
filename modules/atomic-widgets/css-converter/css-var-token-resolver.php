<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
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
}

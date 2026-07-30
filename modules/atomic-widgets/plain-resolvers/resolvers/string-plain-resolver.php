<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class String_Plain_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		if ( ! is_string( $plain_value ) && ! is_numeric( $plain_value ) ) {
			return null;
		}

		return (string) $plain_value;
	}
}

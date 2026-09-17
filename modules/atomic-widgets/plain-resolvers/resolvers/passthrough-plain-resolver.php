<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registry fallback for prop types without a dedicated leaf resolver.
 * Passes the plain value through; Plain_Values_Resolver wraps it via Prop_Type::generate().
 */
class Passthrough_Plain_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		return $plain_value;
	}
}

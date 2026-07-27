<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Boolean_Plain_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		return (bool) $plain_value;
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Identity_Plain_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		return $plain_value;
	}
}

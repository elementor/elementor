<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Number_Plain_Resolver extends Plain_Resolver_Base {
	private bool $is_float;

	public function __construct( bool $is_float = false ) {
		$this->is_float = $is_float;
	}

	public function resolve( $plain_value ) {
		if ( ! is_numeric( $plain_value ) ) {
			return null;
		}

		return $this->is_float ? (float) $plain_value : (int) $plain_value;
	}
}

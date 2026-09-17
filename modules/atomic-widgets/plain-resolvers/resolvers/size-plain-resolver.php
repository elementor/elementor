<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Plain_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		if ( is_array( $plain_value ) && isset( $plain_value['$$type'] ) ) {
			return $plain_value;
		}

		if ( ! is_array( $plain_value ) || ! array_key_exists( 'size', $plain_value ) || ! array_key_exists( 'unit', $plain_value ) ) {
			return null;
		}

		return [
			'size' => is_numeric( $plain_value['size'] ) ? +$plain_value['size'] : $plain_value['size'],
			'unit' => (string) $plain_value['unit'],
		];
	}
}

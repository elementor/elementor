<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_V3_Plain_Resolver extends Plain_Resolver_Base {
	private Plain_Values_Resolver $walker;

	public function __construct( Plain_Values_Resolver $walker ) {
		$this->walker = $walker;
	}

	public function resolve( $plain_value ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		$converted = [];

		if ( array_key_exists( 'content', $plain_value ) ) {
			$resolved_content = $this->walker->resolve(
				$plain_value['content'],
				String_Prop_Type::make()
			);

			if ( null === $resolved_content ) {
				return null;
			}

			$converted['content'] = $resolved_content;
		}

		if ( array_key_exists( 'children', $plain_value ) ) {
			if ( ! is_array( $plain_value['children'] ) ) {
				return null;
			}

			$converted['children'] = $plain_value['children'];
		}

		if ( empty( $converted ) ) {
			return null;
		}

		return $converted;
	}
}

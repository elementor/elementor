<?php

namespace Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Mcp\Abilities\Dynamic_Tag_Llm_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Plain_Resolver extends Plain_Resolver_Base {
	private Plain_Values_Resolver $walker;

	public function __construct( Plain_Values_Resolver $walker ) {
		$this->walker = $walker;
	}

	public function resolve( $plain_value ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		if ( ! isset( $plain_value['name'] ) || ! is_string( $plain_value['name'] ) ) {
			return null;
		}

		// Dynamic tag `settings` are validated recursively inside Dynamic_Tag_Llm_Resolver.

		$settings_resolver = fn( $value, Prop_Type $prop_type ) => $this->walker->resolve( $value, $prop_type );

		return Dynamic_Tag_Llm_Resolver::resolve( $plain_value, $settings_resolver );
	}
}

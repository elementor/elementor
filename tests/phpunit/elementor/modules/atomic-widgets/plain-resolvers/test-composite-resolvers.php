<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Dynamic_Plain_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Composite_Resolvers extends TestCase {

	public function test_dynamic_resolver__returns_null_for_non_object_input() {
		$registry = new Plain_Resolvers_Registry();
		$resolver = new Plain_Values_Resolver( $registry );
		$dynamic_resolver = new Dynamic_Plain_Resolver( $resolver );

		$this->assertNull( $dynamic_resolver->resolve( 'not-an-object' ) );
		$this->assertNull( $dynamic_resolver->resolve( [ 'settings' => [] ] ) );
	}
}

<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Dynamic_Plain_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Composite_Resolvers extends TestCase {

	public function test_dynamic_resolver__returns_null_for_non_object_input() {
		$resolver = new Dynamic_Plain_Resolver();

		$this->assertNull( $resolver->resolve( 'not-an-object' ) );
		$this->assertNull( $resolver->resolve( [ 'settings' => [] ] ) );
	}
}

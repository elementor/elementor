<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mock_Resolver extends Plain_Resolver_Base {
	private $return_value;

	public function __construct( $return_value ) {
		$this->return_value = $return_value;
	}

	public function resolve( $plain_value ) {
		return $this->return_value;
	}
}

class Test_Plain_Resolvers_Registry extends TestCase {

	public function test_register__returns_registered_resolver() {
		$registry = new Plain_Resolvers_Registry();
		$resolver = new Mock_Resolver( 'test' );

		$registry->register( 'test-key', $resolver );

		$this->assertSame( $resolver, $registry->get( 'test-key' ) );
	}

	public function test_has__returns_true_for_registered_key() {
		$registry = new Plain_Resolvers_Registry();
		$registry->register( 'test-key', new Mock_Resolver( 'test' ) );

		$this->assertTrue( $registry->has( 'test-key' ) );
		$this->assertFalse( $registry->has( 'unknown-key' ) );
	}

	public function test_get__returns_null_for_unknown_key_without_fallback() {
		$registry = new Plain_Resolvers_Registry();

		$this->assertNull( $registry->get( 'unknown-key' ) );
	}

	public function test_get__returns_fallback_for_unknown_key() {
		$registry = new Plain_Resolvers_Registry();
		$fallback = new Mock_Resolver( 'fallback' );
		$registry->register_fallback( $fallback );

		$this->assertSame( $fallback, $registry->get( 'unknown-key' ) );
	}

	public function test_get__registered_resolver_takes_precedence_over_fallback() {
		$registry = new Plain_Resolvers_Registry();
		$resolver = new Mock_Resolver( 'specific' );
		$fallback = new Mock_Resolver( 'fallback' );

		$registry->register( 'test-key', $resolver );
		$registry->register_fallback( $fallback );

		$this->assertSame( $resolver, $registry->get( 'test-key' ) );
	}

	public function test_get__explicit_fallback_argument_overrides_registered_fallback() {
		$registry = new Plain_Resolvers_Registry();
		$registered_fallback = new Mock_Resolver( 'registered' );
		$explicit_fallback = new Mock_Resolver( 'explicit' );

		$registry->register_fallback( $registered_fallback );

		$this->assertSame( $explicit_fallback, $registry->get( 'unknown-key', $explicit_fallback ) );
	}
}

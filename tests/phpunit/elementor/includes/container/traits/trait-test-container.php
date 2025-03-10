<?php

namespace Elementor\Tests\Phpunit\Includes\Container\Traits;

trait Trait_Test_Container {
	public function bind( $abstract, $concrete ): void {
		$this->container->set( $abstract, \ElementorDeps\DI\create( $concrete ) );
	}
}

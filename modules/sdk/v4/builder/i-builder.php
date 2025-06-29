<?php

namespace Elementor\Modules\Sdk\V4\Builder;

/**
 * @interface I_Builder
 * @description Passed via elementor SDK widget hooks to build and register new widgets using a simpler API
 * @since 3.32.0
 */
interface I_Builder {

	public function configure( array $partial ): void;
	public function build(): void;
	public function set( string $key, $value ): void;
	public function get( string $key ): mixed;
}

<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): array;

	abstract public function execute( $input = [] );

	public function register(): void {
		wp_register_ability( $this->get_ability_id(), $this->get_definition() );
	}
}

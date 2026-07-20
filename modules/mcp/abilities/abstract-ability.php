<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): Ability_Definition;

	abstract public function execute( $input = [] );

	public function register(): void {
		$definition = $this->get_definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute' ];
		wp_register_ability( $this->get_ability_id(), $definition );
	}
}

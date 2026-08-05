<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): Ability_Definition;

	abstract public function execute( $input = [] );

	public function check_permission(): bool {
		return (bool) call_user_func( $this->get_definition()->permission_callback );
	}

	public function permission_error(): ?\WP_Error {
		if ( $this->check_permission() ) {
			return null;
		}

		return new \WP_Error(
			'rest_forbidden',
			__( 'Sorry, you are not allowed to perform this action.', 'elementor' ),
			[ 'status' => \WP_Http::FORBIDDEN ]
		);
	}

	public function register(): void {
		$definition = $this->get_definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute' ];
		wp_register_ability( $this->get_ability_id(), $definition );
	}
}

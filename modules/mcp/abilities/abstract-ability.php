<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Utils\Editor_Session_Guard;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	abstract protected function get_ability_id(): string;

	abstract protected function get_definition(): Ability_Definition;

	abstract public function execute( $input = [] );

	final public function execute_guarded( $input = [] ) {
		$guard = apply_filters( 'elementor/mcp/pre_execute_guard', null, $input );
		if ( is_wp_error( $guard ) ) {
			return $guard;
		}

		$result  = $this->execute( $input );
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		if ( $post_id > 0 && ! is_wp_error( $result ) ) {
			Editor_Session_Guard::set_mcp_mutation( $post_id );
		}

		return $result;
	}

	public function check_permission(): bool {
		return (bool) call_user_func( $this->get_definition()->permission_callback );
	}

	final public function register(): void {
		$definition = $this->get_definition()->to_array();
		$definition['execute_callback'] = [ $this, 'execute_guarded' ];
		wp_register_ability( $this->get_ability_id(), $definition );
	}
}

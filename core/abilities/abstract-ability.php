<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Abstract_Ability {

	abstract protected function get_name(): string;

	abstract protected function get_config(): array;

	abstract public function execute( array $input ): array;

	final public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	final public function register_ability(): void {
		wp_register_ability(
			$this->get_name(),
			array_merge(
				$this->get_config(),
				[
					'execute_callback'    => [ $this, 'execute' ],
					'permission_callback' => [ $this, 'permission' ],
				]
			)
		);
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}
}

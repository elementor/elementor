<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enable_Agent_Ready_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/enable-agent-ready';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Enable Agent Ready', 'elementor' ),
			Prompt_Loader::load( 'enable-agent-ready' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'activated' => [ 'type' => 'boolean' ],
					'enabledModules' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
					],
					'skippedModules' => [
						'type' => 'object',
						'additionalProperties' => [
							'type' => 'object',
							'properties' => [
								'code' => [ 'type' => 'string' ],
								'message' => [ 'type' => 'string' ],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'manage_options' )
		);
	}

	public function execute( $input = [] ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
		}

		$agents = $this->get_agents_module();
		if ( ! $agents ) {
			return $this->error( 'agents_unavailable', __( 'Agent Ready is not available.', 'elementor' ), \WP_Http::SERVICE_UNAVAILABLE );
		}

		return $agents->activate_agent_ready();
	}

	private function get_agents_module(): ?Agents_Module {
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );

		return $module instanceof Agents_Module ? $module : null;
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}

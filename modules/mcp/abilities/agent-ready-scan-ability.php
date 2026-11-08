<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Agent_Ready_Scan_Ability extends Abstract_Ability {

	const ACTION_READ = 'read';
	const ACTION_RUN = 'run';

	protected function get_ability_id(): string {
		return 'elementor/agent-ready-scan';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Agent Ready scan', 'elementor' ),
			Prompt_Loader::load( 'agent-ready-scan' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'report' => [
						'type' => [ 'object', 'null' ],
						'description' => 'Saved scan report, or null when no scan has completed yet.',
					],
					'retryAt' => [
						'type' => [ 'string', 'null' ],
						'description' => 'ISO-8601 timestamp when another scan is allowed, if a cooldown is active.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'manage_options' ),
			[
				'type' => 'object',
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => [ self::ACTION_READ, self::ACTION_RUN ],
						'default' => self::ACTION_READ,
						'description' => 'read returns the saved report and cooldown. run triggers a new scan when not in cooldown.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
		}

		$input  = is_array( $input ) ? $input : [];
		$action = isset( $input['action'] ) && is_string( $input['action'] ) ? $input['action'] : self::ACTION_READ;

		if ( ! in_array( $action, [ self::ACTION_READ, self::ACTION_RUN ], true ) ) {
			return $this->error( 'invalid_input', __( 'A valid action is required.', 'elementor' ), \WP_Http::BAD_REQUEST );
		}

		$agents = $this->get_agents_module();
		if ( ! $agents ) {
			return $this->error( 'agents_unavailable', __( 'Agent Ready is not available.', 'elementor' ), \WP_Http::SERVICE_UNAVAILABLE );
		}

		$orchestrator = $agents->get_scanner_orchestrator();

		return self::ACTION_RUN === $action
			? $orchestrator->run_scan()
			: $orchestrator->read_saved_report();
	}

	private function get_agents_module(): ?Agents_Module {
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );

		return $module instanceof Agents_Module ? $module : null;
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}

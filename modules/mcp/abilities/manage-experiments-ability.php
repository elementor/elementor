<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Experiments\Exceptions\Dependency_Exception;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\OptIn\Opt_In;
use Elementor\Modules\Mcp\Abilities\Utils\Experiments_Catalog;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Experiments_Ability extends Abstract_Ability {

	const ACTION_ACTIVATE = 'activate';
	const ACTION_DEACTIVATE = 'deactivate';
	const ACTION_RESET = 'reset';
	const ACTION_ENABLE_ATOMIC_EDITOR = 'enable_atomic_editor';
	const ACTION_DISABLE_ATOMIC_EDITOR = 'disable_atomic_editor';

	const EXPERIMENT_ACTION_STATES = [
		self::ACTION_ACTIVATE => Experiments_Manager::STATE_ACTIVE,
		self::ACTION_DEACTIVATE => Experiments_Manager::STATE_INACTIVE,
		self::ACTION_RESET => Experiments_Manager::STATE_DEFAULT,
	];

	const ATOMIC_EDITOR_ACTIONS = [ self::ACTION_ENABLE_ATOMIC_EDITOR, self::ACTION_DISABLE_ATOMIC_EDITOR ];

	protected function get_ability_id(): string {
		return 'elementor/manage-experiments';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Experiments', 'elementor' ),
			Prompt_Loader::load( 'manage-experiments' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'experiment' => Experiments_Catalog::experiment_schema(),
					'atomic_editor' => Experiments_Catalog::atomic_editor_schema(),
					'llm_instructions' => [
						'type' => 'string',
						'description' => 'Mandatory next step: follow this text and include it in your reply to the user.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => true,
					'destructive' => true,
				],
			],
			fn() => current_user_can( 'manage_options' ),
			[
				'type' => 'object',
				'required' => [ 'action' ],
				'properties' => [
					'action' => [
						'type' => 'string',
						'enum' => array_merge( array_keys( self::EXPERIMENT_ACTION_STATES ), self::ATOMIC_EDITOR_ACTIONS ),
						'description' => 'activate / deactivate / reset (back to default) change one experiment and need "name". enable_atomic_editor / disable_atomic_editor turn the Atomic Editor (V4) on or off.',
					],
					'name' => [
						'type' => 'string',
						'description' => 'Experiment name from list-experiments. Required for activate, deactivate and reset.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$action = isset( $input['action'] ) && is_string( $input['action'] ) ? $input['action'] : '';
		$name = isset( $input['name'] ) && is_string( $input['name'] ) ? sanitize_key( $input['name'] ) : '';

		try {
			if ( in_array( $action, self::ATOMIC_EDITOR_ACTIONS, true ) ) {
				return $this->toggle_atomic_editor( $action );
			}

			if ( isset( self::EXPERIMENT_ACTION_STATES[ $action ] ) ) {
				return $this->change_experiment( $action, $name );
			}
		} catch ( Dependency_Exception $e ) {
			return $this->error( 'experiment_dependency_inactive', $e->getMessage(), \WP_Http::CONFLICT );
		} catch ( \InvalidArgumentException $e ) {
			return $this->error( 'invalid_input', $e->getMessage(), \WP_Http::BAD_REQUEST );
		}

		return $this->error( 'invalid_input', __( 'A valid action is required.', 'elementor' ), \WP_Http::BAD_REQUEST );
	}

	private function change_experiment( string $action, string $name ) {
		if ( '' === $name ) {
			return $this->error( 'invalid_input', __( 'The name of the experiment is required.', 'elementor' ), \WP_Http::BAD_REQUEST );
		}

		$feature = Experiments_Catalog::find( $name );

		if ( ! $feature ) {
			return $this->error( 'experiment_not_found', __( 'Experiment not found. Use list-experiments to see the available names.', 'elementor' ), \WP_Http::NOT_FOUND );
		}

		if ( ! Experiments_Catalog::is_toggleable( $feature ) ) {
			return $this->error( 'experiment_not_toggleable', __( 'This experiment can not be changed from here.', 'elementor' ), \WP_Http::BAD_REQUEST );
		}

		Plugin::$instance->experiments->set_feature_state( $name, self::EXPERIMENT_ACTION_STATES[ $action ] );

		$response = [
			'success' => true,
			'experiment' => Experiments_Catalog::format( Experiments_Catalog::find( $name ) ),
		];

		$warning = $response['experiment']['deactivation_warning'];

		if ( self::ACTION_DEACTIVATE === $action && null !== $warning ) {
			$response['llm_instructions'] = $warning;
		}

		return $response;
	}

	private function toggle_atomic_editor( string $action ) {
		$opt_in = new Opt_In();

		if ( self::ACTION_ENABLE_ATOMIC_EDITOR === $action ) {
			$opt_in->opt_in_v4();
		} else {
			$opt_in->opt_out_v4();
		}

		$response = [
			'success' => true,
			'atomic_editor' => Experiments_Catalog::atomic_editor_status(),
		];

		if ( self::ACTION_ENABLE_ATOMIC_EDITOR === $action ) {
			$response['llm_instructions'] = __( 'The Atomic Editor is now on. Refresh your tool list to use the V4 tools. Editor tabs the user already has open must be reloaded.', 'elementor' );
		}

		return $response;
	}

	private function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}
}

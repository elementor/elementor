<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use Elementor\Modules\DataFlow\Module as Data_Flow_Module;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Saves or deletes the site-wide custom actions sent with build-composition, manage-component or
 * manage-elements. Runs before element actions are applied, so elements in the same call can reference them.
 */
class Custom_Actions_Applier {

	public static function get_schema(): array {
		return [
			'type' => 'array',
			'description' => 'Requires the e_data_flow experiment and an administrator with unfiltered_html. Site-wide custom actions to create, update ({ name, label?, description?, args?, code }) or delete ({ name, delete: true }) before this call applies element actions, so elements can use them with { on, do: "<name>", args }. Use only when built-in and input actions cannot express the behavior. Editors configure the args with regular controls but never see the code. Read ' . Data_Flow_Guide_Ability::URI . '.',
			'items' => [
				'type' => 'object',
				'required' => [ 'name' ],
				'properties' => [
					'name' => [
						'type' => 'string',
						'description' => '"namespace/action" in lowercase letters, numbers and dashes, e.g. "acme/format-price". The state, class, element, attribute and animation namespaces are reserved.',
					],
					'label' => [
						'type' => 'string',
						'description' => 'Label shown in the editor action picker.',
					],
					'description' => [ 'type' => 'string' ],
					'args' => [
						'type' => 'object',
						'description' => '{ argName: { type, label? } }, shown as controls in the editor.',
						'additionalProperties' => [
							'type' => 'object',
							'properties' => [
								'type' => [
									'type' => 'string',
									'enum' => Actions_Registry::ARG_TYPES,
								],
								'label' => [ 'type' => 'string' ],
							],
						],
					],
					'code' => [
						'type' => 'string',
						'description' => 'A JavaScript function expression receiving { args, element, store, event, value }, e.g. "( { args, store } ) => { store.setState( args.key, ( v ) => v + 1 ); }".',
					],
					'delete' => [
						'type' => 'boolean',
						'description' => 'Deletes the custom action with this name.',
					],
				],
			],
		];
	}

	/**
	 * @param array $definitions Custom action definitions.
	 * @param bool  $persist     False on dry runs: definitions are validated and registered for this request only.
	 */
	public function apply( array $definitions, bool $persist = true ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		if ( empty( $definitions ) ) {
			return $warnings;
		}

		if ( ! Data_Flow_Module::is_active() ) {
			return $warnings->add(
				'custom_actions_experiment_off',
				'Data Flow experiment is not active. Custom actions were not saved.'
			);
		}

		if ( ! Custom_Actions::can_current_user_manage() ) {
			$warnings->add(
				'custom_actions_forbidden',
				'Only administrators who can publish unfiltered HTML can save custom actions. They were skipped; use built-in or input actions instead.'
			);

			return $warnings;
		}

		$custom_actions = Custom_Actions::instance();

		foreach ( array_values( $definitions ) as $definition ) {
			$definition = is_array( $definition ) ? $definition : [];
			$name = is_string( $definition['name'] ?? null ) ? $definition['name'] : '';

			if ( ! empty( $definition['delete'] ) ) {
				$result = $persist ? $custom_actions->delete( $name ) : true;
			} else {
				$result = $persist ? $custom_actions->save( $definition ) : $custom_actions->preview( $definition );
			}

			if ( is_wp_error( $result ) ) {
				$warnings->add( 'custom_action_invalid', $result->get_error_message() . ' See ' . Data_Flow_Guide_Ability::URI . '.', $name );
			}
		}

		return $warnings;
	}
}

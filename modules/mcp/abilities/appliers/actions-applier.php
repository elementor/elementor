<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\DataFlow\Actions_Converter;
use Elementor\Modules\DataFlow\Actions_Parser;
use Elementor\Modules\DataFlow\Props\Event_Action_Prop_Type;
use Elementor\Modules\DataFlow\Props\Input_Action_Prop_Type;
use Elementor\Modules\DataFlow\Props\State_Write_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Actions_Applier {

	public static function get_actions_list_schema(): array {
		return [
			'type' => 'array',
			'items' => [
				'type' => 'object',
				'description' => 'Either an event action { on, key?, do, args? } or an input action { input, space?, inertia?, reducedMotion?, write }. See ' . Data_Flow_Guide_Ability::URI . '.',
				'properties' => [
					'on' => [
						'type' => 'string',
						'enum' => Event_Action_Prop_Type::EVENTS,
						'description' => 'Event action: DOM event on the element, "load" once on page load, or "state" when "key" changes.',
					],
					'key' => [
						'type' => 'string',
						'description' => 'Event action: state key to watch when on is "state".',
					],
					'do' => [
						'type' => 'string',
						'description' => 'Event action: action name, a built-in (state/set, state/toggle, state/increment, state/cycle, state/random, state/from-input, class/toggle, element/visible, attribute/set, animation/playback-rate) or a custom action listed in ' . Data_Flow_Guide_Ability::URI . ' or saved through custom_actions.',
					],
					'args' => [
						'type' => 'object',
						'description' => 'Event action: arguments declared by the action.',
					],
					'input' => [
						'type' => 'string',
						'enum' => array_keys( State_Write_Prop_Type::INPUT_VALUES ),
						'description' => 'Input action: continuous input that writes state every frame while it changes.',
					],
					'space' => [
						'type' => 'string',
						'enum' => Input_Action_Prop_Type::SPACES,
					],
					'inertia' => [ 'type' => 'number' ],
					'reducedMotion' => [
						'type' => 'string',
						'enum' => Input_Action_Prop_Type::REDUCED_MOTION,
					],
					'write' => [
						'type' => 'object',
						'description' => 'Input action: map of state key → { from, map?: [inMin, inMax, outMin, outMax], clamp?, smooth?, spring?: { stiffness?, damping?, mass? }, decay?, round? }.',
						'additionalProperties' => [
							'type' => 'object',
							'required' => [ 'from' ],
							'properties' => [
								'from' => [
									'type' => 'string',
									'enum' => State_Write_Prop_Type::all_input_values(),
								],
								'map' => [
									'type' => 'array',
									'items' => [ 'type' => 'number' ],
									'minItems' => 4,
									'maxItems' => 4,
								],
								'clamp' => [ 'type' => 'boolean' ],
								'smooth' => [ 'type' => 'number' ],
								'spring' => [ 'type' => 'object' ],
								'decay' => [ 'type' => 'number' ],
								'round' => [ 'type' => 'integer' ],
							],
						],
					],
				],
			],
		];
	}

	/**
	 * @param array<string, array&> $index   Index of subtree refs.
	 * @param array<string, mixed>  $actions Per-config-id list of plain actions.
	 */
	public function apply( array &$index, array $actions ): Warnings_Bag {
		$warnings = Warnings_Bag::make();
		$converter = Actions_Converter::make();

		foreach ( $actions as $config_id => $element_actions ) {
			$config_id = (string) $config_id;

			if ( ! isset( $index[ $config_id ] ) ) {
				$warnings->add(
					'actions_unknown_configuration_id',
					'Actions target a configuration-id that is not in xml_structure and were skipped.',
					$config_id
				);
				continue;
			}

			$converted = $converter->from_plain( is_array( $element_actions ) ? $element_actions : [] );

			foreach ( $converted['errors'] as $error ) {
				$warnings->add( 'action_invalid', $error . ' See ' . Data_Flow_Guide_Ability::URI . '.', $config_id );
			}

			if ( empty( $converted['items'] ) ) {
				unset( $index[ $config_id ][ Actions_Parser::DATA_KEY ] );
				continue;
			}

			$index[ $config_id ][ Actions_Parser::DATA_KEY ] = Actions_Parser::wrap( $converted['items'] );
		}

		return $warnings;
	}
}

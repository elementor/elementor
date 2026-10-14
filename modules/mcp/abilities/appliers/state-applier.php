<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;
use Elementor\Modules\DataFlow\Component_State_Params;
use Elementor\Modules\DataFlow\State_Params;
use Elementor\Modules\DataFlow\State_Schema;
use Elementor\Modules\Mcp\Abilities\Data_Flow_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Warnings_Bag;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class State_Applier {

	public static function get_state_params_schema(): array {
		return [
			'type' => [ 'array', 'null' ],
			'items' => [
				'type' => 'object',
				'required' => [ 'key', 'prop_type' ],
				'properties' => [
					'key' => [
						'type' => 'string',
						'pattern' => '^[A-Za-z_]\\w*$',
					],
					'label' => [ 'type' => 'string' ],
					'prop_type' => [
						'type' => 'string',
						'enum' => State_Schema::PROP_TYPES,
						'description' => 'size values are { size, unit }, color values are CSS color strings, image values are { src: { id, url } }, enum needs options.',
					],
					'options' => [
						'type' => 'array',
						'items' => [ 'type' => 'string' ],
						'description' => 'enum only: the allowed values (at most ' . State_Schema::MAX_OPTIONS . ').',
					],
					'exposed' => [
						'type' => 'object',
						'description' => 'Show this key as a control in the container General tab. At most ' . State_Schema::MAX_EXPOSED_CONTROLS . ' keys per container; extra ones are silently not exposed.',
						'properties' => [
							'control' => [
								'type' => 'string',
								'enum' => array_values( array_unique( State_Schema::CONTROLS_BY_PROP_TYPE ) ),
							],
							'label' => [ 'type' => 'string' ],
						],
					],
					'default' => [
						'description' => 'Initial value of the declared prop_type, or a "{{state.key}}" string resolved once from the enclosing scope.',
					],
				],
			],
		];
	}

	public static function get_state_values_schema(): array {
		return [
			'type' => [ 'object', 'null' ],
			'additionalProperties' => true,
		];
	}

	/**
	 * @param array<string, array&> $index        Index of subtree refs.
	 * @param array<string, mixed>  $state_params Per-config-id list of { key, label, type, default } params.
	 */
	public function apply_state_params( array &$index, array $state_params ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $state_params as $config_id => $params ) {
			$config_id = (string) $config_id;

			if ( ! isset( $index[ $config_id ] ) ) {
				$warnings->add( 'state_unknown_configuration_id', 'state_params target a configuration-id that is not in the structure and were skipped.', $config_id );
				continue;
			}

			$sanitized = State_Params::sanitize( $params );

			if ( count( $sanitized ) < $this->count_items( $params ) ) {
				$warnings->add( 'state_params_invalid', $this->get_invalid_params_message(), $config_id );
			}

			$this->set_or_unset( $index[ $config_id ], State_Params::DATA_KEY, $sanitized );
		}

		return $warnings;
	}

	/**
	 * @param array<string, array&> $index  Index of subtree refs.
	 * @param array<string, mixed>  $values Per-config-id map of component param values.
	 */
	public function apply_state_values( array &$index, array $values ): Warnings_Bag {
		$warnings = Warnings_Bag::make();

		foreach ( $values as $config_id => $instance_values ) {
			$config_id = (string) $config_id;

			if ( ! isset( $index[ $config_id ] ) ) {
				$warnings->add( 'state_unknown_configuration_id', 'state targets a configuration-id that is not in the structure and was skipped.', $config_id );
				continue;
			}

			if ( Component_Instance_Prop_Type::WIDGET_TYPE !== ( $index[ $config_id ]['widgetType'] ?? null ) ) {
				$warnings->add( 'state_target_not_component', 'state only applies to <e-component> instances. Use state_params to give a container its own state.', $config_id );
				continue;
			}

			$accepted = $this->accept_instance_values( $index[ $config_id ], $instance_values, $warnings, $config_id );

			$this->set_or_unset( $index[ $config_id ], State_Params::VALUES_DATA_KEY, $accepted );
		}

		return $warnings;
	}

	private function accept_instance_values( array $node, $instance_values, Warnings_Bag $warnings, string $config_id ): array {
		$values = State_Params::sanitize_values( $instance_values );

		if ( empty( $values ) ) {
			return [];
		}

		$component_id = Component_Instance_Prop_Type::extract_component_id( $node['settings'] ?? [] );
		$params = null === $component_id ? [] : Component_State_Params::get( (int) $component_id )['params'];
		$result = State_Params::apply_values( $params, $values );

		foreach ( $result['unknown_keys'] as $key ) {
			$warnings->add( 'state_unknown_key', sprintf( 'The component does not declare a "%1$s" param; it was skipped. See %2$s.', $key, Data_Flow_Guide_Ability::URI ), $config_id );
		}

		foreach ( $result['invalid_keys'] as $key ) {
			$warnings->add( 'state_type_mismatch', sprintf( 'The value for "%s" does not match the param type; the default is kept.', $key ), $config_id );
		}

		$accepted_keys = array_diff( array_keys( $values ), $result['unknown_keys'], $result['invalid_keys'] );
		$defaults = array_column( $result['params'], 'default', 'key' );

		return array_intersect_key( $defaults, array_flip( $accepted_keys ) );
	}

	private function set_or_unset( array &$node, string $key, array $value ): void {
		if ( empty( $value ) ) {
			unset( $node[ $key ] );
			return;
		}

		$node[ $key ] = $value;
	}

	private function count_items( $items ): int {
		return is_array( $items ) ? count( $items ) : 0;
	}

	private function get_invalid_params_message(): string {
		return sprintf(
			'Some state_params were dropped. Each param needs a unique "key" (letters, digits, underscore) and a "prop_type" in [%1$s], with at most %2$d params and %4$d exposed controls per element. See %3$s.',
			implode( ', ', State_Schema::PROP_TYPES ),
			State_Params::MAX_PARAMS,
			Data_Flow_Guide_Ability::URI,
			State_Schema::MAX_EXPOSED_CONTROLS
		);
	}
}

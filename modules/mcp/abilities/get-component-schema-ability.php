<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Component_Schema_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/get-component-schema';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Get Elementor Component Schema', 'elementor' ),
			Prompt_Loader::load( 'get-component-schema' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly'    => true,
					'idempotent'  => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type'       => 'object',
				'required'   => [ 'component_id' ],
				'properties' => [
					'component_id' => [
						'type'        => 'integer',
						'description' => 'Post ID of the component (from elementor/list-components).',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$component_id = isset( $input['component_id'] ) ? (int) $input['component_id'] : 0;

		if ( ! $component_id ) {
			return new \WP_Error(
				'invalid_input',
				__( 'component_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$repository = new Components_Repository();
		$component = $repository->get( $component_id, false );

		if ( ! $component ) {
			return new \WP_Error(
				'elementor_not_found',
				/* translators: %d: component ID */
				sprintf( __( 'Component %d not found.', 'elementor' ), $component_id ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$overridable_props = $component->get_overridable_props();
		$props_schema = $this->build_props_schema( $overridable_props->props );

		return [
			'id'               => $component->get_main_id(),
			'name'             => $component->get_post()->post_title,
			'uid'              => $component->get_component_uid(),
			'is_archived'      => $component->get_is_archived(),
			'overridable_props' => $props_schema,
			'example_shorthand' => $this->build_example_shorthand( $component_id, $props_schema ),
		];
	}

	private function build_props_schema( array $props ): array {
		$schema = [];

		foreach ( $props as $prop ) {
			/** @var Component_Overridable_Prop $prop */
			$origin_prop_schema = $this->resolve_origin_prop_schema( $prop );

			$entry = [
				'label'    => $prop->label,
				'group_id' => $prop->group_id,
			];

			if ( $origin_prop_schema ) {
				$entry['origin_prop_schema'] = $origin_prop_schema;
			}

			$schema[ $prop->override_key ] = $entry;
		}

		return $schema;
	}

	private function resolve_origin_prop_schema( Component_Overridable_Prop $prop ): ?array {
		try {
			if ( $prop->origin_prop_fields ) {
				$prop_type = Parsing_Utils::get_prop_type(
					$prop->origin_prop_fields['el_type'],
					$prop->origin_prop_fields['widget_type'],
					$prop->origin_prop_fields['prop_key']
				);
			} else {
				$prop_type = Parsing_Utils::get_prop_type(
					$prop->el_type,
					$prop->widget_type,
					$prop->prop_key
				);
			}

			return $prop_type->to_json_schema();
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function build_example_shorthand( int $component_id, array $props_schema ): array {
		$overrides = [];
		foreach ( array_keys( $props_schema ) as $override_key ) {
			$overrides[ $override_key ] = '<PropValue per origin_prop_schema>';
		}

		return [
			'component_id' => $component_id,
			'overrides'    => $overrides,
		];
	}
}

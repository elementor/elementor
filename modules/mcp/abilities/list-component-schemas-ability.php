<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Components\Documents\Component_Overridable_Prop;
use Elementor\Modules\Components\Utils\Parsing_Utils;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Component_Schemas_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-component-schemas';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Component Schemas', 'elementor' ),
			Prompt_Loader::load( 'list-component-schemas' ),
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
				'required'   => [ 'component_ids' ],
				'properties' => [
					'component_ids' => [
						'type'        => 'array',
						'items'       => [ 'type' => 'integer' ],
						'minItems'    => 1,
						'description' => 'Post IDs of components to fetch full schemas for (from elementor/list-components).',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$component_ids = $this->normalize_ids( $input['component_ids'] ?? null );

		if ( empty( $component_ids ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'component_ids must be a non-empty array of positive integers.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$repository = new Components_Repository();
		$components = [];
		$not_found = [];

		foreach ( $component_ids as $component_id ) {
			$component = $repository->get( $component_id, false );

			if ( ! $component ) {
				$not_found[] = $component_id;
				continue;
			}

			$components[] = [
				'id'                => $component->get_main_id(),
				'name'              => $component->get_post()->post_title,
				'uid'               => $component->get_component_uid(),
				'is_archived'       => $component->get_is_archived(),
				'overridable_props' => $this->build_props_schema( $component->get_overridable_props()->props ),
			];
		}

		if ( ! empty( $not_found ) ) {
			return new \WP_Error(
				'elementor_not_found',
				sprintf(
					/* translators: %s: comma-separated list of component IDs */
					__( 'Components not found: %s.', 'elementor' ),
					implode( ', ', $not_found )
				),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return [ 'components' => $components ];
	}

	private function normalize_ids( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return [];
		}

		$ids = [];

		foreach ( $raw as $value ) {
			$id = (int) $value;

			if ( $id > 0 ) {
				$ids[ $id ] = $id;
			}
		}

		return array_values( $ids );
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

			return Widget_Context_Helper::to_plain_llm_schema( $prop_type );
		} catch ( \Exception $e ) {
			return null;
		}
	}
}

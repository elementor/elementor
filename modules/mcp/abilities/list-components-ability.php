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

class List_Components_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/list-components';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Components', 'elementor' ),
			Prompt_Loader::load( 'list-components' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'components' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'id'          => [ 'type' => 'integer' ],
								'name'        => [ 'type' => 'string' ],
								'uid'         => [ 'type' => 'string' ],
								'is_archived' => [ 'type' => 'boolean' ],
								'overridable_props' => [
									'type' => 'object',
									'description' => 'Only present for components requested via component_ids.',
								],
							],
						],
					],
				],
			],
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
				'properties' => [
					'component_ids' => [
						'type'        => 'array',
						'items'       => [ 'type' => 'integer' ],
						'description' => 'Post IDs of the components you intend to place. Omit to list every component without its overridable props, then call again with the ids you need.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$requested_ids = is_array( $input['component_ids'] ?? null ) ? $input['component_ids'] : [];

		if ( empty( $requested_ids ) ) {
			return [ 'components' => $this->build_summaries() ];
		}

		$component_ids = $this->normalize_ids( $requested_ids );

		if ( empty( $component_ids ) ) {
			return new \WP_Error(
				'invalid_input',
				__( 'component_ids must contain positive integers.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $this->build_schemas( $component_ids );
	}

	private function build_summaries(): array {
		$repository = new Components_Repository();

		return array_values(
			$repository->all()
				->map( fn( $component ) => [
					'id'          => $component['id'],
					'name'        => $component['title'],
					'uid'         => $component['uid'],
					'is_archived' => $component['is_archived'] ?? false,
				] )
				->all()
		);
	}

	private function build_schemas( array $component_ids ) {
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

	private function normalize_ids( array $raw ): array {
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

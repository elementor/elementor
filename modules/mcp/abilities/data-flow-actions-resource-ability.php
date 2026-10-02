<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\DataFlow\Actions_Registry;
use Elementor\Modules\DataFlow\Custom_Actions;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Data_Flow_Actions_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://data-flow/actions';
	const DESCRIPTION = 'Every action elements can run with { on, do, args }: built-in, plugin and custom actions with their argument schemas. Custom actions include their code for administrators.';

	protected function get_ability_id(): string {
		return 'elementor/data-flow-actions-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Data Flow Actions', 'elementor' ),
			self::DESCRIPTION,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => self::DESCRIPTION,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$with_code = Custom_Actions::can_current_user_manage();
		$actions = [];

		foreach ( Actions_Registry::instance()->all() as $definition ) {
			$action = [
				'name' => $definition['name'],
				'label' => $definition['label'],
				'description' => $definition['description'],
				'source' => $definition['source'],
				'args' => (object) array_map( [ Widget_Context_Helper::class, 'to_plain_llm_schema' ], $definition['args'] ),
			];

			if ( $with_code && Actions_Registry::SOURCE_CUSTOM === $definition['source'] ) {
				$action['code'] = Custom_Actions::instance()->get( $definition['name'] )['code'] ?? null;
			}

			$actions[] = $action;
		}

		return wp_json_encode( [ 'actions' => $actions ] );
	}
}

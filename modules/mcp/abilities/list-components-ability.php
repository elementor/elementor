<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Components\Components_Repository;
use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;

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
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$repository = new Components_Repository();

		$components = array_values(
			$repository->all()
				->map( fn( $component ) => [
					'id'          => $component['id'],
					'name'        => $component['title'],
					'uid'         => $component['uid'],
					'is_archived' => $component['is_archived'] ?? false,
				] )
				->all()
		);

		return [ 'components' => $components ];
	}
}

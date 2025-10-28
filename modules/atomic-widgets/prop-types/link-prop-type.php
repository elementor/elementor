<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'link';
	}

	static function getDefaultMeta(): array {
		return [
			'llm' => [
				'propType' => 'object',
				'description' => 'Defines a link with destination URL and whether it opens in a new tab.',
				'schema' => [
					'type' => 'object',
					'required' => [ 'destination' ],
					'properties' => [
						'destination' => [
							'type' => [ 'string' ],
							'description' => 'The URL or query object for the link destination.',
						],
						'isTargetBlank' => [
							'type' => 'boolean',
							'description' => 'Whether to open the link in a new tab.',
						],
					],
				]
			],
		];
	}

	protected function define_shape(): array {
		$target_blank_dependencies = Dependency_Manager::make()
		->where( [
			'operator' => 'exists',
			'path' => [ 'link', 'destination' ],
		] )
		->get();

		return [
			'destination' => Union_Prop_Type::make()
				->add_prop_type( Url_Prop_Type::make()->skip_validation() )
				->add_prop_type( Query_Prop_Type::make() ),
			'isTargetBlank' => Boolean_Prop_Type::make()
				->set_dependencies( $target_blank_dependencies ),
		];
	}
}

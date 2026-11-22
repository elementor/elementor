<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Definitions\Validation\Template_Rules;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Composite_Widgets_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://composite-widgets';

	/** @var callable(): Widgets_Definitions_Registry */
	private $get_registry;

	/**
	 * @param callable(): Widgets_Definitions_Registry $get_registry
	 */
	public function __construct( callable $get_registry ) {
		$this->get_registry = $get_registry;
	}

	protected function get_ability_id(): string {
		return 'elementor/composite-widgets-resource';
	}

	protected function get_definition(): Ability_Definition {
		$description = __( 'Composite widgets: ready-made structures placed with <e-widget> in elementor/build-composition. Each lists its parts (configure a part under "<configuration-id>.<part>" with that element\'s schema), its main fields with the prop schema, and whether it can be inserted now.', 'elementor' );

		return new Ability_Definition(
			__( 'Composite Widgets', 'elementor' ),
			$description,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type' => 'resource',
					'uri' => self::URI,
					'public' => true,
					'mimeType' => 'application/json',
					'description' => $description,
				],
			],
			fn () => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$registry = ( $this->get_registry )();

		return wp_json_encode( [
			'widgets' => array_values( array_map( [ Widget_Schema_Builder::class, 'build' ], $registry->all() ) ),
			'allowed_part_types' => Template_Rules::get_allowed_types(),
		] );
	}
}

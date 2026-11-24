<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\CompositeWidgets\Definitions\Validation\Template_Rules;
use Elementor\Modules\CompositeWidgets\Definitions\Widgets_Definitions_Registry;
use Elementor\Modules\CompositeWidgets\Module;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Composite_Widgets_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://composite-widgets';

	private ?Widgets_Definitions_Registry $registry;

	public function __construct( ?Widgets_Definitions_Registry $registry = null ) {
		$this->registry = $registry;
	}

	protected function get_ability_id(): string {
		return 'elementor/composite-widgets-resource';
	}

	protected function get_definition(): Ability_Definition {
		$description = __( 'Composite widgets: ready-made structures placed with <e-widget> in elementor/build-composition. Read it before placing one: it lists each widget\'s parts, main fields and whether it can be inserted now, and how to configure them.', 'elementor' );

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
		$registry = $this->registry ?? Module::get_active_registry();

		return wp_json_encode( [
			'usage' => $this->get_usage(),
			'widgets' => $registry ? array_values( array_map( [ Widget_Schema_Builder::class, 'build' ], $registry->all() ) ) : [],
			'allowed_part_types' => Template_Rules::get_allowed_types(),
		] );
	}

	/**
	 * @return string[]
	 */
	private function get_usage(): array {
		return [
			__( 'Place a widget in elementor/build-composition as the self-closing leaf tag <e-widget configuration-id="buy-button"/>, with element_config { "buy-button": { "widget_id": "<widget id>" } } only. <e-widget> takes no children.', 'elementor' ),
			__( 'Configure a part under the key "<configuration-id>.<part>" (e.g. "buy-button.label") in element_config, style, classes and interactions, with that part element\'s own schema. The widget\'s configuration-id alone styles its root. A key that matches no part is skipped with a widget_part_not_found warning; never use a part key as another element\'s configuration-id.', 'elementor' ),
			__( 'Parts marked "repeated": true exist once per repeater item, so they can\'t be configured at insertion (widget_part_repeated warning); edit each item with elementor/manage-elements afterwards.', 'elementor' ),
			__( 'resolved_xml has the widget root\'s element id only; read its parts\' element ids with elementor/get-page-structure. The structure is closed: settings and styles of its parts can be updated with elementor/manage-elements, but parts can\'t be added, moved, duplicated or deleted. Only a part with "slot": true takes new children (pass its element id as parent_id).', 'elementor' ),
			__( 'Only insert widgets with "insertable": true. Widget ids starting with "site/" are saved site widgets and need an active Elementor Pro license; without it they are skipped and reported in pro_features_discovery, and the rest of the composition is built.', 'elementor' ),
		];
	}
}

<?php

namespace Elementor\Modules\CompositeWidgets\Mcp;

use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stands in for Elementor Pro's `elementor/manage-widget` while Pro isn't installed, so an agent asked
 * to save a widget gets the upgrade path. Its input keys match Pro's ability.
 */
class Manage_Widget_Pro_Features_Discovery_Ability extends Abstract_Ability {
	const ABILITY_ID = 'elementor/manage-widget';
	const ACTIONS = [ 'create', 'update', 'archive', 'delete' ];

	protected function get_ability_id(): string {
		return self::ABILITY_ID;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Saved Widgets', 'elementor' ),
			__( 'Save a block as a site widget (a ready-made widget placed on any page with the same structure and design, with its own simple content and style controls), and update, archive or delete saved widgets. Saved widgets are an Elementor Pro feature: without Pro every call returns pro_license_required with an upgrade link. When the user asks to save a block as a reusable widget, call this tool anyway and relay the message as given.', 'elementor' ),
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn () => current_user_can( 'manage_options' ),
			$this->get_input_schema()
		);
	}

	public function supports_dry_run(): bool {
		return true;
	}

	public function execute( $input = [] ) {
		$action = is_array( $input ) && is_string( $input['action'] ?? null ) ? $input['action'] : '';

		return Site_Widgets_Pro_Features_Discovery::for_manage( $action );
	}

	private function get_input_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'action' ],
			'properties' => [
				'action' => [
					'type' => 'string',
					'enum' => self::ACTIONS,
				],
				'widget_id' => [ 'type' => 'string' ],
				'title' => [ 'type' => 'string' ],
				'xml_structure' => [ 'type' => 'string' ],
				'element_config' => [ 'type' => 'object' ],
				'style' => [ 'type' => 'object' ],
				'classes' => [ 'type' => 'object' ],
				'source' => [ 'type' => 'object' ],
				'parts' => [ 'type' => 'object' ],
				'definition' => [ 'type' => 'object' ],
				'archived' => [ 'type' => 'boolean' ],
			],
		];
	}
}

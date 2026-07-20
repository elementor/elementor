<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://global-classes';

	protected function get_ability_id(): string {
		return 'elementor/global-classes-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Global Classes', 'elementor' ),
			__( 'Reusable CSS classes from the active kit; check FIRST before adding inline styles.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Global class definitions and order from the active kit.', 'elementor' ),
				],
			],
			self::default_permission_callback()
		);
	}

	public function execute( $input = [] ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$classes_payload = Global_Classes_Repository::make( $kit )->all_labels();

		return wp_json_encode( $classes_payload );
	}
}

<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Resource_Ability extends Abstract_Ability {
	const URI = 'elementor://global-classes';

	private ?Global_Classes_Repository $repository;

	public function __construct( ?Global_Classes_Repository $repository = null ) {
		$this->repository = $repository;
	}

	protected function get_ability_id(): string {
		return 'elementor/global-classes-resource';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Global Classes', 'elementor' ),
			__( 'Reusable CSS classes from the active kit, ordered from highest to lowest CSS priority. Check first before adding inline styles.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'application/json',
					'description' => __( 'Reusable CSS classes from the active kit, ordered from highest to lowest CSS priority. Check first before adding inline styles.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$classes = [];
		foreach ( $this->get_repository()->all_labels() as $id => $label ) {
			$classes[] = [
				'id' => $id,
				'label' => $label,
			];
		}

		return wp_json_encode( [
			'priority_description' => __( 'Classes are ordered from highest to lowest priority. When classes on the same element set the same CSS property, the earlier class overrides the later one.', 'elementor' ),
			'classes' => $classes,
		] );
	}

	private function get_repository(): Global_Classes_Repository {
		if ( $this->repository ) {
			return $this->repository;
		}

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		return Global_Classes_Repository::make( $kit );
	}
}

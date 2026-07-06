<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\AtomicWidgets\PropTypes\Dialect\Dialect_Walker;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class To_Canonical_Ability extends Abstract_Ability {
	protected function get_ability_id(): string {
		return 'elementor/to-canonical';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Convert to Canonical PropValues', 'elementor' ),
			__( 'Converts dialect prop values to Elementor canonical PropValues.', 'elementor' ),
			'elementor',
			[
				'type'       => 'object',
				'required'   => [ 'widget_type', 'props', 'dialect' ],
				'properties' => [
					'widget_type' => [ 'type' => 'string' ],
					'props'       => [ 'type' => 'object' ],
					'dialect'     => [ 'type' => 'string' ],
				],
			],
			[],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		$widget_type = $input['widget_type'] ?? null;
		$props       = $input['props'] ?? [];
		$dialect     = $input['dialect'] ?? 'llm';

		if ( ! $widget_type ) {
			return new \WP_Error( 'missing_widget_type', __( 'widget_type is required', 'elementor' ), [ 'status' => 400 ] );
		}

		$prop_types = $this->get_atomic_prop_types( $widget_type );

		if ( is_wp_error( $prop_types ) ) {
			return $prop_types;
		}

		$canonical = [];

		foreach ( $props as $key => $dialect_value ) {
			$prop_type = $prop_types[ $key ] ?? null;

			if ( ! $prop_type ) {
				continue;
			}

			$canonical[ $key ] = Dialect_Walker::to_canonical( $prop_type, $dialect, $dialect_value );
		}

		return $canonical;
	}

	private function get_atomic_prop_types( string $widget_type ) {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type )
			?? Plugin::$instance->elements_manager->get_element_types( $widget_type );

		if ( ! $widget ) {
			return new \WP_Error(
				'widget_not_found',
				sprintf(
					/* translators: %s: widget type */
					__( 'Widget type not found: %s', 'elementor' ),
					$widget_type
				),
				[ 'status' => 404 ]
			);
		}

		$config = $widget->get_config();

		if ( empty( $config['atomic'] ) || empty( $config['atomic_props_schema'] ) ) {
			return new \WP_Error(
				'not_v4_widget',
				sprintf(
					/* translators: %s: widget type */
					__( 'Widget %s is not a V4 atomic widget', 'elementor' ),
					$widget_type
				),
				[ 'status' => 422 ]
			);
		}

		return $config['atomic_props_schema'];
	}
}

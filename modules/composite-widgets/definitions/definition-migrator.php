<?php

namespace Elementor\Modules\CompositeWidgets\Definitions;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Schema_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Definitions never pass through `elementor/document/load/data`, so their atom data is migrated here
 * before validation. Copies already on pages are never rewritten when a definition changes.
 */
class Definition_Migrator {
	private Migrations_Orchestrator $orchestrator;

	public function __construct( Migrations_Orchestrator $orchestrator ) {
		$this->orchestrator = $orchestrator;
	}

	public function migrate( array &$definition ): void {
		if ( is_array( $definition['template'] ?? null ) ) {
			$this->orchestrator->migrate_data( $definition['template'] );
		}

		if ( ! is_array( $definition['style']['appearance'] ?? null ) ) {
			return;
		}

		foreach ( $definition['style']['appearance'] as &$preset ) {
			if ( ! is_array( $preset['options'] ?? null ) ) {
				continue;
			}

			foreach ( $preset['options'] as &$option ) {
				if ( ! is_array( $option['set'] ?? null ) ) {
					continue;
				}

				foreach ( $option['set'] as &$write ) {
					$this->migrate_preset_write( $write );
				}
			}
		}
	}

	/**
	 * Preset values are keyed by breakpoint, so they are wrapped as style variants for the duration
	 * of the migration: the schema resolver only finds style prop types under `variants` / `props`.
	 */
	private function migrate_preset_write( &$write ): void {
		if ( ! is_array( $write['style'] ?? null ) ) {
			return;
		}

		foreach ( $write['style'] as &$props ) {
			if ( ! is_array( $props ) ) {
				continue;
			}

			$wrapped = [ Schema_Resolver::STYLE_VARIANTS_PATH => [ [ Schema_Resolver::STYLE_PROPS_PATH => $props ] ] ];

			$this->orchestrator->migrate_data( $wrapped );

			$props = $wrapped[ Schema_Resolver::STYLE_VARIANTS_PATH ][0][ Schema_Resolver::STYLE_PROPS_PATH ];
		}
	}
}

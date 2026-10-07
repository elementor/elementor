<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Map;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A map provider (Google Maps, OpenStreetMap, Mapbox, ...) plugged into `Atomic_Map_Base`.
 *
 * The provider template is the element's main template. It must compute `embed_src`
 * (and optionally `allow_fullscreen`) and then include `Atomic_Map_Base::BASE_TEMPLATE_KEY`.
 *
 * Provider-specific prop keys must be prefixed with the provider key (e.g. `google_map_type`),
 * so a future multi-provider element can merge all provider schemas without collisions.
 */
abstract class Map_Provider_Base {
	abstract public function get_key(): string;

	abstract public function get_label(): string;

	/**
	 * @return array<string, string> Single `[ template_key => absolute_path ]` entry.
	 */
	abstract public function get_templates(): array;

	abstract public function get_external_url( string $location ): string;

	/**
	 * Static values available to the provider template under `provider.*`.
	 * Exposed to the editor, so it must not contain secrets beyond what ends up in the embed URL anyway.
	 */
	public function get_template_context(): array {
		return [];
	}

	public function define_props_schema(): array {
		return [];
	}

	public function define_controls(): array {
		return [];
	}

	public function get_keywords(): array {
		return [];
	}
}

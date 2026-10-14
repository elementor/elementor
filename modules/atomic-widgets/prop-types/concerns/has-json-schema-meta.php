<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Json_Schema_Meta {
	/**
	 * Enriches the given JSON schema fragment with prop-type meta (e.g. `description`).
	 * Callers typically pass an empty array to start a fresh meta bag, but may pass
	 * pre-existing schema keys that should be preserved alongside the meta.
	 */
	protected function with_json_schema_meta( array $schema ): array {
		$description = $this->get_meta_item( 'description' );

		if ( $description ) {
			$schema['description'] = $description;
		}

		return $schema;
	}
}

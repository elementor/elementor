<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Json_Schema_Meta {
	protected function with_json_schema_meta( array $schema ): array {
		$description = $this->get_meta_item( 'description' );

		if ( $description ) {
			$schema['description'] = $description;
		}

		$initial_value = $this->get_initial_value();

		if ( null !== $initial_value ) {
			$schema['examples'] = [ $initial_value ];
		}

		return $schema;
	}
}

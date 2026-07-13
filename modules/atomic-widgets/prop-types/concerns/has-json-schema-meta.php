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

		return $schema;
	}
}

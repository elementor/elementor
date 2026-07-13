<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
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

	protected function wrap_json_schema( array $value_schema ): array {
		$schema = $this->with_json_schema_meta( [] );

		$schema['type'] = 'object';
		$schema['properties'] = [
			'$$type' => [
				'type' => 'string',
				'const' => static::get_key(),
			],
			'value' => $value_schema,
		];
		$schema['required'] = [ '$$type', 'value' ];

		return $schema;
	}
}

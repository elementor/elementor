<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Ability_Definition {
	public string $label;
	public string $description;
	public string $category;
	public array $output_schema;
	public array $meta;
	/** @var callable */
	public $permission_callback;
	public array $input_schema;

	public function __construct(
		string $label,
		string $description,
		string $category,
		array $output_schema,
		array $meta,
		callable $permission_callback,
		array $input_schema = []
	) {
		$this->label = $label;
		$this->description = $description;
		$this->category = $category;
		$this->output_schema = $output_schema;
		$this->meta = $meta;
		$this->permission_callback = $permission_callback;
		$this->input_schema = $input_schema;
	}

	public static function empty_object_input_schema(): array {
		return [
			'type' => 'object',
		];
	}

	public function to_array(): array {
		return [
			'label' => $this->label,
			'description' => $this->description,
			'category' => $this->category,
			'output_schema' => $this->output_schema,
			'meta' => $this->meta,
			'permission_callback' => $this->permission_callback,
			'input_schema' => $this->normalized_input_schema(),
		];
	}

	private function normalized_input_schema(): array {
		if ( empty( $this->input_schema ) ) {
			return self::empty_object_input_schema();
		}

		$schema = $this->input_schema;

		if (
			array_key_exists( 'properties', $schema )
			&& is_array( $schema['properties'] )
			&& empty( $schema['properties'] )
		) {
			unset( $schema['properties'] );
		}

		if ( ! isset( $schema['type'] ) ) {
			$schema['type'] = 'object';
		}

		return $schema;
	}
}

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

	public function to_array(): array {
		$definition = [
			'label' => $this->label,
			'description' => $this->description,
			'category' => $this->category,
			'output_schema' => $this->output_schema,
			'meta' => $this->meta,
			'permission_callback' => $this->permission_callback,
		];

		if ( ! empty( $this->input_schema ) ) {
			$definition['input_schema'] = $this->input_schema;
		}

		return $definition;
	}
}

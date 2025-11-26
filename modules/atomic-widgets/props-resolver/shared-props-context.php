<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Shared_Props_Context {
	private array $field_metadata = [];

	public function store_field_metadata( string $field_key, array $metadata ): void {
		$this->field_metadata[ $field_key ] = $metadata;
	}

	public function get_field_metadata( string $field_key ): ?array {
		return $this->field_metadata[ $field_key ] ?? null;
	}

	public function clear(): void {
		$this->field_metadata = [];
	}
}


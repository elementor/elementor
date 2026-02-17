<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Untyped_Prop_Type implements Prop_Type {
	public static function get_key(): string {
		return 'untyped';
	}

	public function get_type(): string {
		return 'untyped';
	}

	public function get_default() {
		return null;
	}

	public function validate( $value ): bool {
		return true;
	}

	public function sanitize( $value ) {
		return $value;
	}

	public function get_meta(): array {
		return [];
	}

	public function get_meta_item( string $key, $default_value = null ) {
		return $default_value;
	}

	public function get_settings(): array {
		return [];
	}

	public function get_setting( string $key, $default_value = null ) {
		return $default_value;
	}

	public function set_dependencies( ?array $dependencies ): self {
		return $this;
	}

	public function get_dependencies(): ?array {
		return null;
	}

	public function get_initial_value() {
		return null;
	}

	public function jsonSerialize(): array {
		return [
			'kind' => 'untyped',
			'key' => static::get_key(),
		];
	}

	public static function make(): self {
		return new self();
	}
}

<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Meta;
use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Required_Setting;
use Elementor\Modules\AtomicWidgets\PropTypes\Concerns\Has_Settings;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Unknown_Prop_Type implements Prop_Type {
	use Has_Meta;
	use Has_Settings;
	use Has_Required_Setting;

	public static function get_key(): string {
		return 'unknown';
	}

	public function get_type(): string {
		return 'unknown';
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
			'kind' => 'unknown',
			'key' => static::get_key(),
			'settings' => (object) $this->get_settings(),
			'meta' => (object) $this->get_meta(),
		];
	}

	public static function make(): self {
		return new self();
	}
}

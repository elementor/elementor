<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Prop_Type
 */
trait Has_Settings {
	protected array $settings = [];

	public function setting( $key, $value ): self {
		$this->settings[ $key ] = $value;

		return $this;
	}

	public function get_settings(): array {
		return $this->settings;
	}

	public function get_setting( string $key, $default = null ) {
		return $this->settings[ $key ] ?? $default;
	}
}

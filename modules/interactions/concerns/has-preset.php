<?php

namespace Elementor\Modules\Interactions\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Preset {
		protected $presets = null;

	public static function generate_preset(): array {
		$value = [
			'$$type' => static::get_key(),
			'value' => $value,
		];

		return $value;
	}

	abstract public static function get_key(): string;
}

// trait Has_Default {
//	protected $default = null;
//
//	/**
//	 * @param $value
//	 *
//	 * @return $this
//	 */
//	public function default( $value ) {
//		$this->default = static::generate( $value );
//
//		return $this;
//	}
//
//	public function get_default() {
//		return $this->default;
//	}
//
//	abstract public static function generate( $value, $disable = false ): array;
//}

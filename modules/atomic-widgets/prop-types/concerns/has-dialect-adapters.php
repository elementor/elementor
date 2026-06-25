<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Dialect_Adapters {
	private array $dialect_adapters = [];

	public static function define_default_dialects(): array {
		return [];
	}

	/**
	 * @return $this
	 */
	public function with_dialect( string $dialect, string $adapter_class ) {
		$this->dialect_adapters[ $dialect ] = $adapter_class;

		return $this;
	}

	public function get_dialect_adapters(): array {
		return array_merge( static::define_default_dialects(), $this->dialect_adapters );
	}
}

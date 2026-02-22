<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Transformable_Prop_Type implements Prop_Type {
	protected $version = 1;

	abstract public static function get_key(): string;
	abstract public static function generate( $value, $disable = false ): array;

	public function get_version(): int {
		return $this->version;
	}

	public function jsonSerialize(): array {
		return [
			'version' => $this->version,
		];
	}
}

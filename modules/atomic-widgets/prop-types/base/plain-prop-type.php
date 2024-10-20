<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Plain_Prop_Type implements Transformable_Prop_Type {
	const TYPE = 'plain';

	use Concerns\Has_Meta,
		Concerns\Has_Settings,
		Concerns\Has_Default,
		Concerns\Has_Transformable_Validation,
		Concerns\Has_Required_Validation;

	public static function make(): self {
		return new static();
	}

	public function default( $value ): self {
		$this->default = [
			'$$type' => static::get_key(),
			'value' => $value,
		];

		return $this;
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return $this->validate_transformable( $value );
	}

	public function jsonSerialize(): array {
		return [
			'type' => static::TYPE,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
		];
	}

	abstract public static function get_key(): string;

	abstract protected function validate_value( $value ): bool;
}

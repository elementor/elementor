<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Plain_Prop_Type implements Transformable_Prop_Type {
	const KIND = 'plain';

	use Concerns\Has_Default,
		Concerns\Has_Generate,
		Concerns\Has_Meta,
		Concerns\Has_Required_Setting,
		Concerns\Has_Settings,
		Concerns\Has_Transformable_Validation;

	/**
	 * @return static
	 */
	public static function make() {
		return new static();
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return (
			$this->is_transformable( $value ) &&
			$this->validate_value( $value['value'] )
		);
	}

	public function jsonSerialize(): array {
		return [
			'kind' => static::KIND,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
		];
	}

	abstract public static function get_key(): string;

	abstract protected function validate_value( $value ): bool;
}

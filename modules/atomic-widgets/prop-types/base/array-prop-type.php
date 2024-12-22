<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Array_Prop_Type implements Transformable_Prop_Type {
	const KIND = 'array';

	use Concerns\Has_Default,
		Concerns\Has_Generate,
		Concerns\Has_Meta,
		Concerns\Has_Required_Setting,
		Concerns\Has_Settings,
		Concerns\Has_Transformable_Validation;

	protected Prop_Type $item_type;

	public function __construct() {
		$this->item_type = $this->define_item_type();
	}

	/**
	 * @return static
	 */
	public static function make() {
		return new static();
	}

	/**
	 * @param Prop_Type $item_type
	 *
	 * @return $this
	 */
	public function set_item_type( Prop_Type $item_type ) {
		$this->item_type = $item_type;

		return $this;
	}

	public function get_item_type(): Prop_Type {
		return $this->item_type;
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

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$prop_type = $this->get_item_type();

		foreach ( $value as $item ) {
			if ( $prop_type && ! $prop_type->validate( $item ) ) {
				return false;
			}
		}

		return true;
	}

	public function jsonSerialize(): array {
		return [
			'kind' => static::KIND,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'item_prop_type' => $this->get_item_type(),
		];
	}

	abstract protected function define_item_type(): Prop_Type;
}

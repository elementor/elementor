<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Array_Prop_Type extends Prop_Type {
	protected ?Prop_Type $item_prop_type = null;

	public static function get_type(): string {
		return 'array';
	}

	public function __construct() {
		$this->item_prop_type = $this->define_item_prop_type();
	}

	public function get_item_prop_type(): ?Prop_Type {
		return $this->item_prop_type;
	}

	public function generate_value( $value ) {
		$item_prop_type = $this->get_item_prop_type();

		return [
			'$$type' => static::get_key(),
			'value' => array_map(
				fn( $item ) => $item_prop_type->generate_value( $value ),
				$value
			),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$prop_type = $this->get_item_prop_type();

		foreach ( $value as $item ) {
			if ( $prop_type && ! $prop_type->validate( $item ) ) {
				return false;
			}
		}

		return true;
	}

	public function jsonSerialize(): array {
		return [
			...parent::jsonSerialize(),
			'item_prop_type' => $this->get_item_prop_type(),
		];
	}

	abstract protected function define_item_prop_type(): Prop_Type;
}

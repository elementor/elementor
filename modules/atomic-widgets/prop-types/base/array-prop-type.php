<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Array_Prop_Type extends Prop_Type {
	protected ?Prop_Type $prop = null;

	public static function get_type(): string {
		return 'array';
	}

	public function __construct() {
		$this->prop = $this->init_prop();
	}

	public function get_prop(): ?Prop_Type {
		return $this->prop;
	}

	public function generate_value( $value ) {
		$item_prop_type = $this->get_prop();

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

		$prop_type = $this->get_prop();

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
			'prop' => $this->get_prop(),
		];
	}

	abstract protected function init_prop(): Prop_Type;
}

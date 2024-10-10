<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Array_Prop_Type extends Prop_Type {
	protected ?Prop_Type_Interface $prop = null;

	public static function get_type(): string {
		return 'array';
	}

	public function __construct() {
		$this->prop = $this->init_prop();
	}

	public function get_prop(): ?Prop_Type_Interface {
		return $this->prop;
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $item ) {
			$valid_item = false;

			foreach ( $this->get_props() as $prop_type ) {
				if ( $prop_type instanceof Prop_Type ) {
					throw new \Exception( 'Prop type must be an instance of `Prop_Type`.' );
				}

				if ( $prop_type->validate( $item ) ) {
					$valid_item = true;

					break;
				}
			}

			if ( ! $valid_item ) {
				return false;
			}
		}

		return true;
	}

	public function generate_value( $value ) {
		$item_prop_type = $this->get_prop();

		return [
			'$$type' => static::get_type(),
			'value' => array_map(
				fn ($item) => $item_prop_type->generate_value( $value ),
				$value
			),
		];
	}

	public function jsonSerialize() {
		return [
			'type' => static::get_type(),
			'value' => [
				...parent::jsonSerialize()['value'] ?? [],
				'prop' => $this->get_prop(),
			],
		];
	}

	abstract protected function init_prop(): Prop_Type_Interface;
}

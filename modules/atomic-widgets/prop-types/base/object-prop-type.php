<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Object_Prop_Type extends Prop_Type {
	/**
	 * @var array<Prop_Type>
	 */
	protected array $props = [];

	public static function get_type(): string {
		return 'object';
	}

	public function __construct() {
		$this->props = $this->init_props();
	}

	public function get_props(): array {
		return $this->props;
	}

	public function get_prop( $key ): ?Prop_Type {
		return $this->props[ $key ] ?? null;
	}

	public function generate_value( $value ) {
		$parsed_value = [];

		foreach ( $this->get_props() as $key => $prop_type ) {
			if ( ! isset( $value[ $key ] ) ) {
				continue;
			}

			$parsed_value[ $key ] = $prop_type->generate_value( $value[ $key ] );
		}

		return [
			'$$type' => static::get_key(),
			'value' => $parsed_value,
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $this->get_props() as $key => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				Utils::safe_throw( "Object prop type must have a prop type for key: $key" );
			}

			if ( ! $prop_type->validate( $value[ $key ] ?? null ) ) {
				return false;
			}
		}

		return true;
	}

	public function jsonSerialize(): array {
		return [
			...parent::jsonSerialize(),
			'props' => $this->get_props(),
		];
	}

	/**
	 * @return array<Prop_Type>
	 */
	abstract protected function init_props(): array;
}

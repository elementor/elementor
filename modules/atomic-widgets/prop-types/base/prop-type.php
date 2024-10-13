<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {
	protected $default = null;

	protected array $meta = [];

	protected array $settings = [
		'required' => false,
	];

	protected array $sub_types = [];

	public static function make(): self {
		return new static();
	}

	public function default( $value ): self {
		$this->default = $this->generate_value( $value );

		return $this;
	}

	public function meta( $key, $value = null ): self {
		$is_tuple = is_array( $value ) && 2 === count( $value );

		[ $key, $value ] = $is_tuple ? $key : [ $key, $value ];

		$this->meta[ $key ] = $value;

		return $this;
	}

	public function sub_type( Prop_Type $prop_type ): self {
		$this->sub_types[ $prop_type::get_key() ] = $prop_type;

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function get_meta(): array {
		return $this->meta;
	}

	public function get_meta_item( $key ) {
		return $this->meta[ $key ] ?? null;
	}

	protected function get_settings() {
		return $this->settings;
	}

	protected function get_setting( $key ) {
		return $this->settings[ $key ] ?? null;
	}

	public function get_sub_types(): array {
		return $this->sub_types;
	}

	public function get_sub_type( $key ): ?Prop_Type {
		return $this->sub_types[ $key ] ?? null;
	}

	public function get_relevant_prop_types(): array {
		return [
			...$this->get_sub_types(),
			static::get_key() => $this,
		];
	}

	public function required(): self {
		$this->settings['required'] = true;

		return $this;
	}

	public function optional(): self {
		$this->settings['required'] = false;

		return $this;
	}

	public function generate_value( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	public function validate( $value ): bool {
		if ( null === $value ) {
			return ! $this->get_setting( 'required' );
		}

		return $this->validate_self( $value )
			|| $this->validate_sub_types( $value );
	}

	protected function validate_self( $value ): bool {
		return isset( $value['$$type'] )
			&& static::get_key() === $value['$$type']
			&& isset( $value['value'] )
			&& ( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) )
			&& $this->validate_value( $value['value'] );
	}

	protected function validate_sub_types( $value ): bool {
		foreach ( $this->get_sub_types() as $sub_type ) {
			if ( $sub_type->validate( $value ) ) {
				return true;
			}
		}

		return false;
	}

	public function jsonSerialize(): array {
		return [
			'type' => static::get_type(),
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'sub_types' => $this->get_sub_types(),
		];
	}

	abstract public static function get_key(): string;

	abstract public static function get_type(): string;

	abstract protected function validate_value( $value ): bool;
}
